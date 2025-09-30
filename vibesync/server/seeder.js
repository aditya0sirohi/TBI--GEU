require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

async function connectDb() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set in environment variables.');
  }
  await mongoose.connect(mongoUri, { dbName: process.env.MONGO_DB || undefined });
}

const sampleUsers = Array.from({ length: 10 }).map((_, idx) => {
  const n = idx + 1;
  return {
    username: `user${n}`,
    email: `user${n}@example.com`,
    password: `password${n}`,
    profilePicture: `https://i.pravatar.cc/150?u=user${n}`,
  };
});

const botUser = {
  username: 'DonaldTrump',
  email: 'donald.trump@ai.example.com',
  password: 'MakeAIRealAgain!',
  profilePicture: 'https://i.pravatar.cc/150?img=68',
};

async function importData() {
  await connectDb();
  try {
    await User.deleteMany({});
    const saltRounds = 10;
    const usersWithHashes = await Promise.all(
      [...sampleUsers, botUser].map(async (u) => ({
        username: u.username,
        email: u.email,
        password: await bcrypt.hash(u.password, saltRounds),
        profilePicture: u.profilePicture,
      }))
    );
    await User.insertMany(usersWithHashes);
    console.log('User data imported successfully');
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
}

async function destroyData() {
  await connectDb();
  try {
    await User.deleteMany({});
    console.log('All user data destroyed');
    process.exit(0);
  } catch (err) {
    console.error('Destroy failed:', err);
    process.exit(1);
  }
}

const cmd = (process.argv[2] || '').toLowerCase();
if (cmd === 'import' || cmd === 'seed') {
  importData();
} else if (cmd === 'destroy') {
  destroyData();
} else {
  console.log('Usage: node seeder.js <import|seed|destroy>');
  process.exit(0);
}


