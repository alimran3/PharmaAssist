import mongoose from 'mongoose';

const operatingHoursSchema = new mongoose.Schema({
  openingTime: { type: String, default: '08:00' },
  closingTime: { type: String, default: '23:00' },
  weeklyOffDay: { type: String, enum: ['None', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], default: 'None' },
  is24Hours: { type: Boolean, default: false },
}, { _id: false });

const appAddressSchema = new mongoose.Schema({
  division: { type: String, required: true },
  district: { type: String, required: true },
  upazilla: { type: String, required: true },
  ward: String,
  area: String,
}, { _id: false });

const storeSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  pharmacyName: {
    type: String,
    required: [true, 'Pharmacy name is required'],
    trim: true,
    maxlength: 200,
  },
  drugLicenseNumber: {
    type: String,
    default: '',
  },
  tradeLicenseNumber: {
    type: String,
    default: '',
  },
  establishmentYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear(),
  },
  logoUrl: { type: String, default: '' },
  coverPhotoUrl: { type: String, default: '' },

  appAddress: {
    type: appAddressSchema,
    required: true,
  },
  exactAddress: {
    type: String,
    required: [true, 'Physical address is required'],
  },

  phone: {
    type: String,
    required: true,
    match: [/^01[3-9]\d{8}$/, 'Please enter a valid BD phone number'],
  },

  operatingHours: {
    type: operatingHoursSchema,
    default: () => ({}),
  },

  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 1,
  },

  // Ratings
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },

  // Bill customization
  billSettings: {
    showLogo: { type: Boolean, default: true },
    footerMessage: { type: String, default: 'Thank you for choosing our pharmacy!' },
    defaultPaymentMethod: { type: String, enum: ['Cash', 'bKash', 'Nagad', 'Card'], default: 'Cash' },
  },

  status: {
    type: String,
    enum: ['active', 'suspended', 'deactivated', 'pending'],
    default: 'active',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual to check if currently open
storeSchema.virtual('isCurrentlyOpen').get(function () {
  if (!this.operatingHours || this.operatingHours.is24Hours) return true;

  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[now.getDay()];

  if (this.operatingHours.weeklyOffDay === today) return false;

  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return currentTime >= this.operatingHours.openingTime && currentTime <= this.operatingHours.closingTime;
});

storeSchema.index({ 'appAddress.division': 1, 'appAddress.district': 1, 'appAddress.upazilla': 1, 'appAddress.area': 1 });
storeSchema.index({ pharmacyName: 'text' });
storeSchema.index({ status: 1 });

const Store = mongoose.model('Store', storeSchema);
export default Store;