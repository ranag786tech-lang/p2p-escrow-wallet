import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rateRecord = await prisma.exchangeRate.findUnique({
      where: { pair: 'PKR_USDT' },
    });

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { isActive: true },
    });

    const settings = await prisma.adminSettings.findUnique({
      where: { id: 'default' },
    });

    return NextResponse.json({
      success: true,
      rate: rateRecord?.rate || 282.50,
      updatedAt: rateRecord?.updatedAt,
      paymentMethods,
      settings: {
        minPkr: settings?.minPkr || 500,
        maxPkr: settings?.maxPkr || 1000000,
        noticeText: settings?.noticeText || 'Instant USDT transfer within 5-15 mins upon receipt verification.',
      },
    });
  } catch (error: any) {
    console.error('Error fetching exchange info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exchange configuration' },
      { status: 500 }
    );
  }
}
