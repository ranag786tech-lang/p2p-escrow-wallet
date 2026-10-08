import { prisma } from '../lib/prisma';

async function main() {
  console.log('Seeding initial data...');

  // 1. Seed Exchange Rate
  const rate = await prisma.exchangeRate.upsert({
    where: { pair: 'PKR_USDT' },
    update: {},
    create: {
      pair: 'PKR_USDT',
      rate: 282.50,
    },
  });
  console.log('Exchange Rate initialized:', rate);

  // 2. Seed Payment Methods
  const jazzcash = await prisma.paymentMethod.upsert({
    where: { id: 'jazzcash-1' },
    update: {},
    create: {
      id: 'jazzcash-1',
      name: 'JazzCash',
      accountTitle: 'P2P Crypto Exchange',
      accountNumber: '0300-1234567',
      instructions: 'Transfer exact PKR amount to this JazzCash account and upload transaction receipt screenshot.',
      isActive: true,
    },
  });

  const easypaisa = await prisma.paymentMethod.upsert({
    where: { id: 'easypaisa-1' },
    update: {},
    create: {
      id: 'easypaisa-1',
      name: 'Easypaisa',
      accountTitle: 'P2P Crypto Exchange',
      accountNumber: '0345-1234567',
      instructions: 'Transfer exact PKR amount to this Easypaisa account and upload transaction receipt screenshot.',
      isActive: true,
    },
  });

  const bankTransfer = await prisma.paymentMethod.upsert({
    where: { id: 'bank-1' },
    update: {},
    create: {
      id: 'bank-1',
      name: 'Meezan Bank',
      accountTitle: 'Micro P2P Services',
      accountNumber: '0101-0102938481',
      instructions: 'Deposit exact PKR via mobile banking app or ATM and attach payment confirmation.',
      isActive: true,
    },
  });

  console.log('Payment Methods initialized:', [jazzcash.name, easypaisa.name, bankTransfer.name]);

  // 3. Seed Admin Settings
  const settings = await prisma.adminSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      adminPin: '123456',
      minPkr: 500,
      maxPkr: 1000000,
      noticeText: 'Instant USDT transfer within 5-15 mins upon receipt verification.',
    },
  });

  console.log('Admin Settings initialized:', settings);

  // 4. Seed Demo Orders for testing
  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    await prisma.order.create({
      data: {
        orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        pkrAmount: 28250,
        usdtAmount: 100.0,
        exchangeRate: 282.50,
        paymentMethodId: 'jazzcash-1',
        paymentMethodName: 'JazzCash',
        userUsdtWallet: 'T9x2Y7Z1aB3cD4eF5gH6iJ7kL8mN9oP0qR',
        userPhone: '03009998877',
        userEmail: 'trader1@example.com',
        proofTxRef: 'TRX9876543210',
        proofScreenshotUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%230f172a"/><text x="50%" y="50%" fill="%2322c55e" font-size="20" font-family="sans-serif" text-anchor="middle">JazzCash Receipt #TRX9876543210</text></svg>',
        status: 'PENDING',
      },
    });

    await prisma.order.create({
      data: {
        orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        pkrAmount: 14125,
        usdtAmount: 50.0,
        exchangeRate: 282.50,
        paymentMethodId: 'easypaisa-1',
        paymentMethodName: 'Easypaisa',
        userUsdtWallet: 'TQ2mK9vR8sP1xZ4yW3uT6nB5mV8cC1aD2e',
        userPhone: '03451112233',
        userEmail: 'trader2@example.com',
        proofTxRef: 'EP123456789',
        proofScreenshotUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%231e1b4b"/><text x="50%" y="50%" fill="%2338bdf8" font-size="20" font-family="sans-serif" text-anchor="middle">Easypaisa Receipt #EP123456789</text></svg>',
        status: 'APPROVED',
        adminNote: 'Verified on JazzCash business portal',
      },
    });

    console.log('Demo orders created successfully.');
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
