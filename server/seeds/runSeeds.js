import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();
    console.log('Running seeds...');

    // Check if admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
    } else {
      const admin = await User.create({
        fullName: 'System Admin',
        email: 'admin@pharmaassist.com',
        phone: '01700000000',
        password: 'Admin@2025',
        role: 'admin',
        appAddress: {
          division: 'Dhaka',
          district: 'Dhaka',
          upazilla: 'Motijheel',
        },
        exactAddress: 'PharmaAssist HQ, Dhaka',
      });
      console.log('Admin created:', admin.email);
    }

    console.log('\nNow run medicine seed:');
    console.log('  node seeds/medicineSeed.js');
    console.log('\nSeeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

createAdmin();