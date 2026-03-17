import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // ─── Users ───────────────────────────────────────────────────────────────────

  const admin = await prisma.user.upsert({
    where: { email: 'admin@openideth.com' },
    update: {},
    create: {
      email: 'admin@openideth.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  const landlord = await prisma.user.upsert({
    where: { email: 'landlord@openideth.com' },
    update: {},
    create: {
      email: 'landlord@openideth.com',
      passwordHash,
      name: 'Jane Landlord',
      role: 'LANDLORD',
      phone: '+1-555-100-2000',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      emailVerified: true,
    },
  });

  const tenant = await prisma.user.upsert({
    where: { email: 'tenant@openideth.com' },
    update: {},
    create: {
      email: 'tenant@openideth.com',
      passwordHash,
      name: 'John Tenant',
      role: 'TENANT',
      phone: '+1-555-300-4000',
      walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      emailVerified: true,
    },
  });

  console.log('Users seeded:', { admin: admin.id, landlord: landlord.id, tenant: tenant.id });

  // ─── Properties ──────────────────────────────────────────────────────────────

  const property1 = await prisma.property.create({
    data: {
      landlordId: landlord.id,
      title: 'Modern Downtown Apartment',
      description: 'A beautiful 2-bedroom apartment in the heart of downtown with panoramic city views.',
      propertyType: 'APARTMENT',
      address: '123 Main St, Apt 15B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      latitude: 40.7128,
      longitude: -74.006,
      bedrooms: 2,
      bathrooms: 1,
      area: 850,
      monthlyRent: 2500.0,
      depositAmount: 5000.0,
      amenities: ['WiFi', 'Gym', 'Parking', 'Doorman', 'Laundry'],
      rules: ['No smoking', 'No pets over 25 lbs'],
      status: 'ACTIVE',
      availableFrom: new Date('2025-02-01'),
      isVerified: true,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      landlordId: landlord.id,
      title: 'Cozy Studio in Arts District',
      description: 'Charming studio with exposed brick walls and natural light, perfect for a single professional.',
      propertyType: 'STUDIO',
      address: '456 Arts Blvd, Unit 3',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90013',
      country: 'US',
      latitude: 34.0407,
      longitude: -118.2368,
      bedrooms: 0,
      bathrooms: 1,
      area: 450,
      monthlyRent: 1800.0,
      depositAmount: 3600.0,
      amenities: ['WiFi', 'Rooftop Access', 'Bike Storage'],
      rules: ['No smoking', 'Quiet hours 10 PM - 8 AM'],
      status: 'ACTIVE',
      availableFrom: new Date('2025-03-01'),
      isVerified: true,
    },
  });

  const property3 = await prisma.property.create({
    data: {
      landlordId: landlord.id,
      title: 'Spacious Family House',
      description: 'A spacious 4-bedroom house with a large backyard, ideal for families. Close to schools and parks.',
      propertyType: 'HOUSE',
      address: '789 Oak Lane',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'US',
      latitude: 30.2672,
      longitude: -97.7431,
      bedrooms: 4,
      bathrooms: 3,
      area: 2200,
      monthlyRent: 3200.0,
      depositAmount: 6400.0,
      amenities: ['Backyard', 'Garage', 'Central AC', 'Dishwasher'],
      rules: ['Lawn maintenance required', 'No commercial use'],
      status: 'ACTIVE',
      availableFrom: new Date('2025-01-15'),
      isVerified: true,
    },
  });

  const property4 = await prisma.property.create({
    data: {
      landlordId: landlord.id,
      title: 'Commercial Office Space',
      description: 'Open-plan commercial office space in a prime business district. Suitable for startups or small teams.',
      propertyType: 'COMMERCIAL',
      address: '321 Business Park Dr, Suite 200',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'US',
      latitude: 37.7749,
      longitude: -122.4194,
      bedrooms: 0,
      bathrooms: 2,
      area: 1500,
      monthlyRent: 5500.0,
      depositAmount: 11000.0,
      amenities: ['Conference Room', 'Kitchen', 'High-Speed Internet', 'Elevator'],
      rules: ['Business use only', 'No overnight stays'],
      status: 'DRAFT',
      isVerified: false,
    },
  });

  const property5 = await prisma.property.create({
    data: {
      landlordId: landlord.id,
      title: 'Lakefront Apartment',
      description: 'Serene 3-bedroom apartment overlooking the lake with modern finishes throughout.',
      propertyType: 'APARTMENT',
      address: '55 Lakeview Dr, Apt 8A',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'US',
      latitude: 41.8781,
      longitude: -87.6298,
      bedrooms: 3,
      bathrooms: 2,
      area: 1200,
      monthlyRent: 2900.0,
      depositAmount: 5800.0,
      amenities: ['Lake View', 'Pool', 'Gym', 'Concierge', 'Balcony'],
      rules: ['No smoking', 'No pets'],
      status: 'ACTIVE',
      availableFrom: new Date('2025-04-01'),
      isVerified: true,
    },
  });

  console.log('Properties seeded:', [property1.id, property2.id, property3.id, property4.id, property5.id]);

  // ─── Property Images ────────────────────────────────────────────────────────

  await prisma.propertyImage.createMany({
    data: [
      { propertyId: property1.id, url: 'https://images.example.com/apt-downtown-1.jpg', caption: 'Living room', isPrimary: true, order: 0 },
      { propertyId: property1.id, url: 'https://images.example.com/apt-downtown-2.jpg', caption: 'Kitchen', isPrimary: false, order: 1 },
      { propertyId: property2.id, url: 'https://images.example.com/studio-arts-1.jpg', caption: 'Main area', isPrimary: true, order: 0 },
      { propertyId: property3.id, url: 'https://images.example.com/house-austin-1.jpg', caption: 'Front exterior', isPrimary: true, order: 0 },
      { propertyId: property5.id, url: 'https://images.example.com/apt-lake-1.jpg', caption: 'Lake view', isPrimary: true, order: 0 },
    ],
  });

  console.log('Property images seeded');

  // ─── Rental Agreements ──────────────────────────────────────────────────────

  const agreement1 = await prisma.rentalAgreement.create({
    data: {
      propertyId: property1.id,
      landlordId: landlord.id,
      tenantId: tenant.id,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2026-01-31'),
      monthlyRent: 2500.0,
      depositAmount: 5000.0,
      terms: 'Standard 12-month lease agreement. Tenant responsible for utilities. Landlord covers building maintenance.',
      status: 'ACTIVE',
      landlordSignedAt: new Date('2025-01-20'),
      tenantSignedAt: new Date('2025-01-21'),
      landlordSignatureIp: '192.168.1.100',
      tenantSignatureIp: '192.168.1.200',
      documentUrl: 'https://docs.example.com/agreements/agreement-1.pdf',
      documentHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    },
  });

  const agreement2 = await prisma.rentalAgreement.create({
    data: {
      propertyId: property3.id,
      landlordId: landlord.id,
      tenantId: tenant.id,
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      monthlyRent: 3200.0,
      depositAmount: 6400.0,
      terms: 'Draft agreement for family house. Pending final review and signatures.',
      status: 'DRAFT',
    },
  });

  console.log('Rental agreements seeded:', { agreement1: agreement1.id, agreement2: agreement2.id });

  // ─── Escrow Deposits ────────────────────────────────────────────────────────

  await prisma.escrowDeposit.create({
    data: {
      agreementId: agreement1.id,
      amount: 5000.0,
      currency: 'USD',
      status: 'HELD',
      stripePaymentIntentId: 'pi_escrow_001',
    },
  });

  console.log('Escrow deposits seeded');

  // ─── Payments ───────────────────────────────────────────────────────────────

  await prisma.payment.create({
    data: {
      agreementId: agreement1.id,
      payerId: tenant.id,
      payeeId: landlord.id,
      amount: 2500.0,
      currency: 'USD',
      method: 'STRIPE',
      status: 'COMPLETED',
      dueDate: new Date('2025-02-01'),
      paidAt: new Date('2025-01-30'),
      stripePaymentIntentId: 'pi_payment_001',
      platformFee: 62.5,
      netAmount: 2437.5,
    },
  });

  await prisma.payment.create({
    data: {
      agreementId: agreement1.id,
      payerId: tenant.id,
      payeeId: landlord.id,
      amount: 2500.0,
      currency: 'USD',
      method: 'STRIPE',
      status: 'PENDING',
      dueDate: new Date('2025-03-01'),
    },
  });

  await prisma.payment.create({
    data: {
      agreementId: agreement1.id,
      payerId: tenant.id,
      payeeId: landlord.id,
      amount: 2500.0,
      currency: 'ETH',
      method: 'ETH',
      status: 'FAILED',
      dueDate: new Date('2025-04-01'),
      failureReason: 'Insufficient funds in wallet',
    },
  });

  console.log('Payments seeded');

  // ─── Notifications ──────────────────────────────────────────────────────────

  await prisma.notification.createMany({
    data: [
      {
        userId: tenant.id,
        type: 'AGREEMENT_SIGNED',
        title: 'Agreement Signed',
        message: 'Your rental agreement for Modern Downtown Apartment has been fully signed.',
        data: { agreementId: agreement1.id },
        isRead: true,
      },
      {
        userId: tenant.id,
        type: 'PAYMENT_DUE',
        title: 'Payment Due',
        message: 'Your rent payment of $2,500.00 is due on March 1, 2025.',
        data: { amount: 2500, dueDate: '2025-03-01' },
        isRead: false,
      },
      {
        userId: landlord.id,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Received',
        message: 'You received a rent payment of $2,500.00 from John Tenant.',
        data: { amount: 2500, payerName: 'John Tenant' },
        isRead: false,
      },
      {
        userId: admin.id,
        type: 'SYSTEM',
        title: 'Welcome to OpenIDEth',
        message: 'Welcome to the OpenIDEth admin panel. You can manage users, properties, and agreements from here.',
        isRead: false,
      },
    ],
  });

  console.log('Notifications seeded');

  // ─── Reviews ────────────────────────────────────────────────────────────────

  await prisma.review.create({
    data: {
      propertyId: property1.id,
      reviewerId: tenant.id,
      rating: 5,
      comment: 'Excellent apartment with amazing views! The landlord is responsive and the building amenities are top-notch.',
    },
  });

  await prisma.review.create({
    data: {
      propertyId: property2.id,
      reviewerId: tenant.id,
      rating: 4,
      comment: 'Great studio in a vibrant neighborhood. A bit small but very well maintained.',
    },
  });

  console.log('Reviews seeded');

  // ─── Reward Points ──────────────────────────────────────────────────────────

  await prisma.rewardPoint.createMany({
    data: [
      {
        userId: tenant.id,
        points: 100,
        reason: 'Completed first rental payment',
        referenceType: 'PAYMENT',
      },
      {
        userId: landlord.id,
        points: 200,
        reason: 'Listed first property',
        referenceType: 'LISTING',
      },
    ],
  });

  console.log('Reward points seeded');

  // ─── KYC Verifications ──────────────────────────────────────────────────────

  await prisma.kycVerification.create({
    data: {
      userId: landlord.id,
      status: 'APPROVED',
      documentType: 'PASSPORT',
      documentFrontUrl: 'https://docs.example.com/kyc/landlord-passport-front.jpg',
      documentBackUrl: 'https://docs.example.com/kyc/landlord-passport-back.jpg',
      selfieUrl: 'https://docs.example.com/kyc/landlord-selfie.jpg',
      reviewedById: admin.id,
      submittedAt: new Date('2025-01-10'),
      reviewedAt: new Date('2025-01-12'),
    },
  });

  console.log('KYC verifications seeded');

  console.log('Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
