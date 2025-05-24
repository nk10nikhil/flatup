const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flatup';

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['owner', 'broker', 'room_sharer'], default: 'owner' },
  phone: String,
  image: String,
  subscription: {
    status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
    plan: String,
    startDate: Date,
    endDate: Date,
  },
}, { timestamps: true });

// Flat Schema
const flatSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  type: { type: String, required: true },
  availableRooms: { type: Number, required: true },
  totalRooms: { type: Number, required: true },
  images: [String],
  features: {
    furnished: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    gym: { type: Boolean, default: false },
    swimming: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    powerBackup: { type: Boolean, default: false },
  },
  amenities: [String],
  availableFrom: { type: Date, required: true },
  lister: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listerType: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Flat = mongoose.model('Flat', flatSchema);

const sampleFlats = [
  {
    title: 'Modern 2BHK Apartment in Bandra West',
    description: 'Beautiful 2BHK apartment with sea view, fully furnished with modern amenities. Perfect for working professionals or small families.',
    price: 45000,
    location: {
      address: 'Hill Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
    },
    type: '2BHK',
    availableRooms: 1,
    totalRooms: 2,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800',
    ],
    features: {
      furnished: true,
      parking: true,
      wifi: true,
      ac: true,
      gym: true,
      swimming: false,
      security: true,
      powerBackup: true,
    },
    amenities: ['Balcony', 'Modular Kitchen', 'Wardrobe'],
    availableFrom: new Date('2024-02-01'),
    listerType: 'owner',
    isActive: true,
    isFeatured: true,
    views: 125,
  },
  {
    title: 'Spacious PG for Working Professionals in Koramangala',
    description: 'Well-maintained PG accommodation with all basic amenities. Ideal for working professionals and students.',
    price: 15000,
    location: {
      address: '5th Block, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560095',
    },
    type: 'PG',
    availableRooms: 3,
    totalRooms: 10,
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    ],
    features: {
      furnished: true,
      parking: false,
      wifi: true,
      ac: false,
      gym: false,
      swimming: false,
      security: true,
      powerBackup: true,
    },
    amenities: ['Laundry', 'Meals Included', 'Common Area'],
    availableFrom: new Date('2024-01-15'),
    listerType: 'broker',
    isActive: true,
    isFeatured: false,
    views: 89,
  },
  {
    title: 'Luxury 3BHK Villa in Cyber City, Gurgaon',
    description: 'Premium 3BHK villa with private garden and parking. Located in the heart of Cyber City with easy access to offices.',
    price: 65000,
    location: {
      address: 'DLF Cyber City',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122002',
    },
    type: '3BHK',
    availableRooms: 1,
    totalRooms: 3,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800',
    ],
    features: {
      furnished: true,
      parking: true,
      wifi: true,
      ac: true,
      gym: true,
      swimming: true,
      security: true,
      powerBackup: true,
    },
    amenities: ['Private Garden', 'Terrace', 'Study Room'],
    availableFrom: new Date('2024-03-01'),
    listerType: 'owner',
    isActive: true,
    isFeatured: true,
    views: 156,
  },
  {
    title: 'Affordable 1BHK in Andheri East',
    description: 'Budget-friendly 1BHK apartment perfect for bachelors or young couples. Close to metro station and IT parks.',
    price: 25000,
    location: {
      address: 'Chakala, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400099',
    },
    type: '1BHK',
    availableRooms: 1,
    totalRooms: 1,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    ],
    features: {
      furnished: false,
      parking: false,
      wifi: false,
      ac: false,
      gym: false,
      swimming: false,
      security: true,
      powerBackup: false,
    },
    amenities: ['Near Metro', 'Market Nearby'],
    availableFrom: new Date('2024-01-20'),
    listerType: 'room_sharer',
    isActive: true,
    isFeatured: false,
    views: 67,
  },
  {
    title: 'Shared Room in HSR Layout, Bangalore',
    description: 'Looking for a flatmate to share a 2BHK apartment. Fully furnished with all amenities. Great location with easy connectivity.',
    price: 12000,
    location: {
      address: 'Sector 1, HSR Layout',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560102',
    },
    type: 'Shared Room',
    availableRooms: 1,
    totalRooms: 2,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    ],
    features: {
      furnished: true,
      parking: true,
      wifi: true,
      ac: true,
      gym: false,
      swimming: false,
      security: true,
      powerBackup: true,
    },
    amenities: ['Shared Kitchen', 'Balcony Access'],
    availableFrom: new Date('2024-02-15'),
    listerType: 'room_sharer',
    isActive: true,
    isFeatured: false,
    views: 43,
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const sampleUsers = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        password: hashedPassword,
        role: 'owner',
        phone: '+91 9876543210',
        subscription: {
          status: 'active',
          plan: 'owner',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: hashedPassword,
        role: 'broker',
        phone: '+91 9876543211',
        subscription: {
          status: 'active',
          plan: 'broker',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      {
        name: 'Amit Patel',
        email: 'amit@example.com',
        password: hashedPassword,
        role: 'room_sharer',
        phone: '+91 9876543212',
        subscription: {
          status: 'active',
          plan: 'room_sharer',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    ];

    // Clear existing data
    await User.deleteMany({});
    await Flat.deleteMany({});

    // Insert users
    const users = await User.insertMany(sampleUsers);
    console.log('Sample users created');

    // Assign users to flats
    sampleFlats[0].lister = users[0]._id; // Owner
    sampleFlats[1].lister = users[1]._id; // Broker
    sampleFlats[2].lister = users[0]._id; // Owner
    sampleFlats[3].lister = users[2]._id; // Room Sharer
    sampleFlats[4].lister = users[2]._id; // Room Sharer

    // Insert flats
    await Flat.insertMany(sampleFlats);
    console.log('Sample flats created');

    console.log('Database seeded successfully!');
    console.log('Sample users:');
    console.log('- rajesh@example.com (Owner) - password: password123');
    console.log('- priya@example.com (Broker) - password: password123');
    console.log('- amit@example.com (Room Sharer) - password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
