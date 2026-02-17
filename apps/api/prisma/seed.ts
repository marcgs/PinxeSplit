import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create ~150 ISO 4217 currencies
  console.log('Creating currencies...');
  const currencies = [
    // Major currencies
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
    
    // Americas
    { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso', scale: 100 },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', scale: 100 },
    { code: 'CLP', symbol: 'CLP$', name: 'Chilean Peso', scale: 1 },
    { code: 'COP', symbol: 'COL$', name: 'Colombian Peso', scale: 100 },
    { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón', scale: 100 },
    { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso', scale: 100 },
    { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal', scale: 100 },
    { code: 'HNL', symbol: 'L', name: 'Honduran Lempira', scale: 100 },
    { code: 'JMD', symbol: 'J$', name: 'Jamaican Dollar', scale: 100 },
    { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa', scale: 100 },
    { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', scale: 100 },
    { code: 'TTD', symbol: 'TT$', name: 'Trinidad & Tobago Dollar', scale: 100 },
    { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso', scale: 100 },
    { code: 'VES', symbol: 'Bs.S', name: 'Venezuelan Bolívar', scale: 100 },
    
    // Europe
    { code: 'ALL', symbol: 'Lek', name: 'Albanian Lek', scale: 100 },
    { code: 'BAM', symbol: 'KM', name: 'Bosnia-Herzegovina Mark', scale: 100 },
    { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', scale: 100 },
    { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', scale: 100 },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone', scale: 100 },
    { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna', scale: 100 },
    { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', scale: 100 },
    { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna', scale: 1 },
    { code: 'MDL', symbol: 'lei', name: 'Moldovan Leu', scale: 100 },
    { code: 'MKD', symbol: 'ден', name: 'Macedonian Denar', scale: 100 },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', scale: 100 },
    { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', scale: 100 },
    { code: 'RON', symbol: 'lei', name: 'Romanian Leu', scale: 100 },
    { code: 'RSD', symbol: 'Дин.', name: 'Serbian Dinar', scale: 100 },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble', scale: 100 },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', scale: 100 },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira', scale: 100 },
    { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', scale: 100 },
    
    // Asia-Pacific
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', scale: 100 },
    { code: 'AFN', symbol: '؋', name: 'Afghan Afghani', scale: 100 },
    { code: 'AMD', symbol: '֏', name: 'Armenian Dram', scale: 100 },
    { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat', scale: 100 },
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', scale: 100 },
    { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar', scale: 1000 },
    { code: 'BND', symbol: 'B$', name: 'Brunei Dollar', scale: 100 },
    { code: 'GEL', symbol: '₾', name: 'Georgian Lari', scale: 100 },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', scale: 100 },
    { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', scale: 100 },
    { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel', scale: 100 },
    { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar', scale: 1000 },
    { code: 'IRR', symbol: '﷼', name: 'Iranian Rial', scale: 100 },
    { code: 'JOD', symbol: 'JD', name: 'Jordanian Dinar', scale: 1000 },
    { code: 'KHR', symbol: '៛', name: 'Cambodian Riel', scale: 100 },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won', scale: 1 },
    { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar', scale: 1000 },
    { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge', scale: 100 },
    { code: 'LAK', symbol: '₭', name: 'Laotian Kip', scale: 100 },
    { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound', scale: 100 },
    { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', scale: 100 },
    { code: 'MMK', symbol: 'K', name: 'Myanmar Kyat', scale: 100 },
    { code: 'MNT', symbol: '₮', name: 'Mongolian Tugrik', scale: 100 },
    { code: 'MOP', symbol: 'MOP$', name: 'Macanese Pataca', scale: 100 },
    { code: 'MVR', symbol: 'Rf', name: 'Maldivian Rufiyaa', scale: 100 },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', scale: 100 },
    { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee', scale: 100 },
    { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial', scale: 1000 },
    { code: 'PHP', symbol: '₱', name: 'Philippine Peso', scale: 100 },
    { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', scale: 100 },
    { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Rial', scale: 100 },
    { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', scale: 100 },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', scale: 100 },
    { code: 'SYP', symbol: '£S', name: 'Syrian Pound', scale: 100 },
    { code: 'THB', symbol: '฿', name: 'Thai Baht', scale: 100 },
    { code: 'TJS', symbol: 'SM', name: 'Tajikistani Somoni', scale: 100 },
    { code: 'TMT', symbol: 'm', name: 'Turkmenistan Manat', scale: 100 },
    { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', scale: 100 },
    { code: 'UZS', symbol: 'сўм', name: 'Uzbekistani Som', scale: 100 },
    { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', scale: 1 },
    { code: 'YER', symbol: '﷼', name: 'Yemeni Rial', scale: 100 },
    
    // Africa
    { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza', scale: 100 },
    { code: 'BWP', symbol: 'P', name: 'Botswanan Pula', scale: 100 },
    { code: 'CDF', symbol: 'FC', name: 'Congolese Franc', scale: 100 },
    { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar', scale: 100 },
    { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', scale: 100 },
    { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr', scale: 100 },
    { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', scale: 100 },
    { code: 'GMD', symbol: 'D', name: 'Gambian Dalasi', scale: 100 },
    { code: 'GNF', symbol: 'FG', name: 'Guinean Franc', scale: 1 },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', scale: 100 },
    { code: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar', scale: 1000 },
    { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham', scale: 100 },
    { code: 'MGA', symbol: 'Ar', name: 'Malagasy Ariary', scale: 100 },
    { code: 'MRU', symbol: 'UM', name: 'Mauritanian Ouguiya', scale: 100 },
    { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee', scale: 100 },
    { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha', scale: 100 },
    { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical', scale: 100 },
    { code: 'NAD', symbol: 'N$', name: 'Namibian Dollar', scale: 100 },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', scale: 100 },
    { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc', scale: 1 },
    { code: 'SCR', symbol: '₨', name: 'Seychellois Rupee', scale: 100 },
    { code: 'SDG', symbol: 'ج.س.', name: 'Sudanese Pound', scale: 100 },
    { code: 'SOS', symbol: 'Sh', name: 'Somali Shilling', scale: 100 },
    { code: 'SZL', symbol: 'L', name: 'Swazi Lilangeni', scale: 100 },
    { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar', scale: 1000 },
    { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', scale: 100 },
    { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', scale: 1 },
    { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc', scale: 1 },
    { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc', scale: 1 },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand', scale: 100 },
    { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha', scale: 100 },
    { code: 'ZWL', symbol: 'Z$', name: 'Zimbabwean Dollar', scale: 100 },
    
    // Oceania
    { code: 'FJD', symbol: 'FJ$', name: 'Fijian Dollar', scale: 100 },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', scale: 100 },
    { code: 'PGK', symbol: 'K', name: 'Papua New Guinean Kina', scale: 100 },
    { code: 'TOP', symbol: 'T$', name: 'Tongan Paʻanga', scale: 100 },
    { code: 'WST', symbol: 'WS$', name: 'Samoan Tālā', scale: 100 },
    { code: 'XPF', symbol: '₣', name: 'CFP Franc', scale: 1 },
    
    // Additional currencies
    { code: 'BBD', symbol: 'Bds$', name: 'Barbadian Dollar', scale: 100 },
    { code: 'BMD', symbol: 'BD$', name: 'Bermudian Dollar', scale: 100 },
    { code: 'BOB', symbol: 'Bs.', name: 'Bolivian Boliviano', scale: 100 },
    { code: 'BSD', symbol: 'B$', name: 'Bahamian Dollar', scale: 100 },
    { code: 'BYN', symbol: 'Br', name: 'Belarusian Ruble', scale: 100 },
    { code: 'BZD', symbol: 'BZ$', name: 'Belize Dollar', scale: 100 },
    { code: 'CVE', symbol: '$', name: 'Cape Verdean Escudo', scale: 100 },
    { code: 'DJF', symbol: 'Fdj', name: 'Djiboutian Franc', scale: 1 },
    { code: 'ERN', symbol: 'Nfk', name: 'Eritrean Nakfa', scale: 100 },
    { code: 'GYD', symbol: 'G$', name: 'Guyanese Dollar', scale: 100 },
    { code: 'HTG', symbol: 'G', name: 'Haitian Gourde', scale: 100 },
    { code: 'KGS', symbol: 'сом', name: 'Kyrgyzstani Som', scale: 100 },
    { code: 'KPW', symbol: '₩', name: 'North Korean Won', scale: 100 },
    { code: 'LRD', symbol: 'L$', name: 'Liberian Dollar', scale: 100 },
    { code: 'LSL', symbol: 'L', name: 'Lesotho Loti', scale: 100 },
    { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Córdoba', scale: 100 },
    { code: 'PYG', symbol: '₲', name: 'Paraguayan Guaraní', scale: 1 },
    { code: 'SBD', symbol: 'SI$', name: 'Solomon Islands Dollar', scale: 100 },
    { code: 'SLL', symbol: 'Le', name: 'Sierra Leonean Leone', scale: 100 },
    { code: 'SRD', symbol: 'Sr$', name: 'Surinamese Dollar', scale: 100 },
    { code: 'STN', symbol: 'Db', name: 'São Tomé and Príncipe Dobra', scale: 100 },
    { code: 'VUV', symbol: 'Vt', name: 'Vanuatu Vatu', scale: 1 },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: currency,
      create: currency,
    });
  }
  console.log(`✅ Created ${currencies.length} currencies`);

  // Create hierarchical categories
  console.log('Creating categories...');
  
  // First, create parent categories
  const parentCategories = [
    { name: 'Food & Drink', icon: '🍽️', color: '#FF6B6B' },
    { name: 'Transportation', icon: '🚗', color: '#4ECDC4' },
    { name: 'Utilities', icon: '💡', color: '#FCBAD3' },
    { name: 'Entertainment', icon: '🎬', color: '#95E1D3' },
    { name: 'Home', icon: '🏠', color: '#AA96DA' },
    { name: 'Life', icon: '❤️', color: '#FFD93D' },
    { name: 'Uncategorized', icon: '📝', color: '#C7CEEA' },
  ];

  const createdParents: Record<string, { id: string }> = {};
  
  for (const category of parentCategories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: category,
      create: category,
    });
    createdParents[category.name] = created;
  }
  console.log(`✅ Created ${parentCategories.length} parent categories`);

  // Then, create child categories
  const childCategories = [
    // Food & Drink children
    { name: 'Groceries', icon: '🛒', color: '#FF6B6B', parentName: 'Food & Drink' },
    { name: 'Dining out', icon: '🍴', color: '#FF6B6B', parentName: 'Food & Drink' },
    { name: 'Coffee & Tea', icon: '☕', color: '#FF6B6B', parentName: 'Food & Drink' },
    { name: 'Fast food', icon: '🍔', color: '#FF6B6B', parentName: 'Food & Drink' },
    
    // Transportation children
    { name: 'Gas', icon: '⛽', color: '#4ECDC4', parentName: 'Transportation' },
    { name: 'Public transit', icon: '🚇', color: '#4ECDC4', parentName: 'Transportation' },
    { name: 'Parking', icon: '🅿️', color: '#4ECDC4', parentName: 'Transportation' },
    { name: 'Taxi & Rideshare', icon: '🚕', color: '#4ECDC4', parentName: 'Transportation' },
    
    // Utilities children
    { name: 'Electricity', icon: '💡', color: '#FCBAD3', parentName: 'Utilities' },
    { name: 'Water', icon: '💧', color: '#FCBAD3', parentName: 'Utilities' },
    { name: 'Internet & Phone', icon: '📱', color: '#FCBAD3', parentName: 'Utilities' },
    { name: 'Gas & Heating', icon: '🔥', color: '#FCBAD3', parentName: 'Utilities' },
    
    // Entertainment children
    { name: 'Movies', icon: '🎥', color: '#95E1D3', parentName: 'Entertainment' },
    { name: 'Music & Concerts', icon: '🎵', color: '#95E1D3', parentName: 'Entertainment' },
    { name: 'Sports', icon: '⚽', color: '#95E1D3', parentName: 'Entertainment' },
    { name: 'Games', icon: '🎮', color: '#95E1D3', parentName: 'Entertainment' },
    
    // Home children
    { name: 'Rent', icon: '🏘️', color: '#AA96DA', parentName: 'Home' },
    { name: 'Furniture', icon: '🛋️', color: '#AA96DA', parentName: 'Home' },
    { name: 'Home maintenance', icon: '🔧', color: '#AA96DA', parentName: 'Home' },
    { name: 'Home supplies', icon: '🧹', color: '#AA96DA', parentName: 'Home' },
    
    // Life children
    { name: 'Healthcare', icon: '🏥', color: '#FFD93D', parentName: 'Life' },
    { name: 'Insurance', icon: '🛡️', color: '#FFD93D', parentName: 'Life' },
    { name: 'Education', icon: '📚', color: '#FFD93D', parentName: 'Life' },
    { name: 'Personal care', icon: '💇', color: '#FFD93D', parentName: 'Life' },
    { name: 'Clothing', icon: '👕', color: '#FFD93D', parentName: 'Life' },
  ];
  
  for (const category of childCategories) {
    const { parentName, ...categoryData } = category;
    const parentId = createdParents[parentName].id;
    
    await prisma.category.upsert({
      where: { name: category.name },
      update: { ...categoryData, parentId },
      create: { ...categoryData, parentId },
    });
  }
  console.log(`✅ Created ${childCategories.length} child categories`);
  console.log(`✅ Total: ${parentCategories.length + childCategories.length} categories`);

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
