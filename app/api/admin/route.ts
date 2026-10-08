import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to verify PIN
function isAuthorized(request: Request) {
  const pinHeader = request.headers.get('x-admin-pin');
  const expectedPin = process.env.ADMIN_PIN || '123456';
  return pinHeader === expectedPin;
}

// GET all orders and settings for Admin
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const rateRecord = await prisma.exchangeRate.findUnique({
      where: { pair: 'PKR_USDT' },
    });

    const paymentMethods = await prisma.paymentMethod.findMany();
    const settings = await prisma.adminSettings.findUnique({ where: { id: 'default' } });

    return NextResponse.json({
      success: true,
      orders,
      rate: rateRecord?.rate || 282.50,
      paymentMethods,
      settings,
    });
  } catch (error: any) {
    console.error('Admin API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch admin data' }, { status: 500 });
  }
}

// PATCH to update order status or exchange rate
export async function PATCH(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, orderId, status, adminNote, newRate, minPkr, maxPkr, noticeText } = body;

    if (action === 'UPDATE_ORDER_STATUS') {
      if (!orderId || !status) {
        return NextResponse.json({ success: false, error: 'Order ID and status required' }, { status: 400 });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status,
          adminNote: adminNote !== undefined ? adminNote : undefined,
        },
      });

      return NextResponse.json({ success: true, order: updatedOrder });
    }

    if (action === 'UPDATE_RATE') {
      if (!newRate || isNaN(Number(newRate)) || Number(newRate) <= 0) {
        return NextResponse.json({ success: false, error: 'Valid positive rate is required' }, { status: 400 });
      }

      const updatedRate = await prisma.exchangeRate.upsert({
        where: { pair: 'PKR_USDT' },
        update: { rate: Number(newRate) },
        create: { pair: 'PKR_USDT', rate: Number(newRate) },
      });

      return NextResponse.json({ success: true, rate: updatedRate.rate });
    }

    if (action === 'UPDATE_SETTINGS') {
      const updatedSettings = await prisma.adminSettings.upsert({
        where: { id: 'default' },
        update: {
          minPkr: minPkr !== undefined ? Number(minPkr) : undefined,
          maxPkr: maxPkr !== undefined ? Number(maxPkr) : undefined,
          noticeText: noticeText !== undefined ? noticeText : undefined,
        },
        create: {
          id: 'default',
          minPkr: minPkr !== undefined ? Number(minPkr) : 500,
          maxPkr: maxPkr !== undefined ? Number(maxPkr) : 1000000,
          noticeText: noticeText !== undefined ? noticeText : 'Instant USDT transfer within 5-15 mins.',
        },
      });

      return NextResponse.json({ success: true, settings: updatedSettings });
    }

    return NextResponse.json({ success: false, error: 'Invalid action requested' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin update error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to execute admin update' }, { status: 500 });
  }
}
