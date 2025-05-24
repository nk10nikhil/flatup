const mongoose = require('mongoose');

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

const User = mongoose.model('User', userSchema);

async function addPhoneNumbers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update existing users with phone numbers
    const users = await User.find({});
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      if (!user.phone) {
        // Generate a random phone number
        const phoneNumber = `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`;
        await User.findByIdAndUpdate(user._id, { phone: phoneNumber });
        console.log(`Updated ${user.name} with phone: ${phoneNumber}`);
      }
    }

    console.log('Phone numbers added to all users!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
}

addPhoneNumbers();
