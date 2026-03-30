import User from '../models/User.js';
import Store from '../models/Store.js';
import { generateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const registerPatient = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, dateOfBirth, gender, bloodGroup, appAddress, exactAddress } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, phone, and password are required.',
      });
    }

    // Validate appAddress
    if (!appAddress || !appAddress.division || !appAddress.district || !appAddress.upazilla) {
      return res.status(400).json({
        success: false,
        message: 'Please select your complete location (Division, District, and Upazilla).',
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered.' : 'Phone number already registered.',
      });
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: 'patient',
      dateOfBirth,
      gender,
      bloodGroup,
      appAddress,
      exactAddress,
    });

    const token = generateToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully.',
      data: { user: userObj, token },
    });
  } catch (error) {
    console.error('Register patient error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({
        success: false,
        message: messages,
      });
    }
    next(error);
  }
};

export const registerStoreOwner = async (req, res, next) => {
  try {
    const {
      fullName, email, phone, password,
      pharmacyName, drugLicenseNumber, tradeLicenseNumber,
      establishmentYear, logoUrl, coverPhotoUrl,
      appAddress, exactAddress, operatingHours,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, phone, and password are required.',
      });
    }

    // Validate appAddress
    if (!appAddress || !appAddress.division || !appAddress.district || !appAddress.upazilla) {
      return res.status(400).json({
        success: false,
        message: 'Please select your complete location (Division, District, and Upazilla).',
      });
    }

    // Validate pharmacy name
    if (!pharmacyName || !pharmacyName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Pharmacy name is required.',
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered.' : 'Phone number already registered.',
      });
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: 'storeOwner',
      appAddress,
      exactAddress,
    });

    const store = await Store.create({
      owner: user._id,
      pharmacyName,
      drugLicenseNumber,
      tradeLicenseNumber,
      establishmentYear,
      logoUrl,
      coverPhotoUrl,
      appAddress,
      exactAddress,
      phone,
      operatingHours,
    });

    const token = generateToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'Store owner registered successfully. Your pharmacy is now active.',
      data: { user: userObj, store, token },
    });
  } catch (error) {
    console.error('Register store owner error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({
        success: false,
        message: messages,
      });
    }
    if (error.name === 'MongooseError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/phone and password.',
      });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended or deactivated. Contact admin.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const token = generateToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;

    let store = null;
    if (user.role === 'storeOwner') {
      store = await Store.findOne({ owner: user._id });
    }

    res.json({
      success: true,
      message: 'Login successful.',
      data: { user: userObj, store, token },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('currentMedicines');
    let store = null;
    if (user.role === 'storeOwner') {
      store = await Store.findOne({ owner: user._id });
    }

    res.json({
      success: true,
      data: { user, store },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'fullName', 'phone', 'photoUrl', 'dateOfBirth', 'gender', 'bloodGroup',
      'appAddress', 'exactAddress', 'allergies', 'medicalConditions',
      'currentMedicines', 'pregnancyStatus', 'smokingStatus', 'emergencyContact',
      'previousSurgeries', 'height', 'weight', 'familyHistory',
      'notificationPreferences', 'privacySettings', 'language', 'darkMode',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Recalculate BMI if height or weight updated
    if (updates.height || updates.weight) {
      const h = updates.height || req.user.height;
      const w = updates.weight || req.user.weight;
      if (h && w) {
        const hm = h / 100;
        updates.bmi = parseFloat((w / (hm * hm)).toFixed(1));
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password changed successfully.',
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};