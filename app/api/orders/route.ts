import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      pkrAmount,
      usdtAmount,
      paymentMethodId,
      userUsdtWallet,
      userPhone,
      userEmail,
      proofScreenshotUrl,
      proofTxRef,
    } = body;

    if (!pkrAmount || !usdtAmount || !userUsdtWallet || !paymentMethodId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (amount, wallet address, or payment method).' },
        { status: 400 }
      );
    }

    // TRC-20 wallet validation basic format check (starts with T and length around 34)
    const cleanWallet = userUsdtWallet.trim();
    if (!cleanWallet.startsWith('T') || cleanWallet.length < 30) {
      return NextResponse.json(
        { success: false, error: 'Invalid TRC-20 USDT Wallet Address. Must start with "T".' },
        { status: 400 }
      );
    }

    // Fetch active rate
    const rateRecord = await prisma.exchangeRate.findUnique({
      where: { pair: 'PKR_USDT' },
    });
    const currentRate = rateRecord?.rate || 282.50;

    // Fetch payment method name
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Selected payment method does not exist.' },
        { status: 400 }
      );
    }

    // Generate unique Order Number (e.g., ORD-782910)
    const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        pkrAmount: Number(pkrAmount),
        usdtAmount: Number(usdtAmount),
        exchangeRate: currentRate,
        paymentMethodId: paymentMethod.id,
        paymentMethodName: paymentMethod.name,
        userUsdtWallet: cleanWallet,
        userPhone: userPhone ? String(userPhone).trim() : null,
        userEmail: userEmail ? String(userEmail).trim() : null,
        proofScreenshotUrl: proofScreenshotUrl || null,
        proofTxRef: proofTxRef ? String(proofTxRef).trim() : null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to submit order' },
      { status: 500 }
    );
  }
}
