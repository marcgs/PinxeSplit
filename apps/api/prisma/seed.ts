import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default currencies
  console.log('Creating currencies...');
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar', scale: 100 },
    { code: 'EUR', symbol: '€', name: 'Euro', scale: 100 },
    { code: 'GBP', symbol: '£', name: 'British Pound', scale: 100 },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', scale: 1 },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', scale: 100 },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', scale: 100 },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', scale: 100 },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', scale: 100 },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', scale: 100 },
    { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', scale: 100 },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: currency,
      create: currency,
    });
  }
  console.log(`✅ Created ${currencies.length} currencies`);

  // Create default categories
  console.log('Creating categories...');
  const categories = [
    { name: 'Food & Dining', icon: '🍽️', color: '#FF6B6B' },
    { name: 'Transportation', icon: '🚗', color: '#4ECDC4' },
    { name: 'Entertainment', icon: '🎬', color: '#95E1D3' },
    { name: 'Shopping', icon: '🛍️', color: '#F38181' },
    { name: 'Housing', icon: '🏠', color: '#AA96DA' },
    { name: 'Utilities', icon: '💡', color: '#FCBAD3' },
    { name: 'Healthcare', icon: '🏥', color: '#FFFFD2' },
    { name: 'Travel', icon: '✈️', color: '#A8D8EA' },
    { name: 'Other', icon: '📝', color: '#C7CEEA' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: category,
      create: category,
    });
  }
  console.log(`✅ Created ${categories.length} categories`);

  // Create dev users for mock authentication
  console.log('Creating dev users...');
  const devUsers = [
    {
      email: 'alice@dev.local',
      firstName: 'Alice',
      lastName: 'Anderson',
      name: 'Alice Anderson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      defaultCurrency: 'USD',
      authProvider: 'mock',
    },
    {
      email: 'bob@dev.local',
      firstName: 'Bob',
      lastName: 'Builder',
      name: 'Bob Builder',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      defaultCurrency: 'EUR',
      authProvider: 'mock',
    },
    {
      email: 'charlie@dev.local',
      firstName: 'Charlie',
      lastName: 'Chen',
      name: 'Charlie Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
      defaultCurrency: 'GBP',
      authProvider: 'mock',
    },
  ];

  for (const user of devUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }
  console.log(`✅ Created ${devUsers.length} dev users`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
