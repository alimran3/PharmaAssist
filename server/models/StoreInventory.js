import mongoose from 'mongoose';

const storeInventorySchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterMedicine',
    required: true,
  },
  batchNumber: {
    type: String,
    default: '',
  },
  buyingDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  buyingPrice: {
    type: Number,
    required: [true, 'Buying price is required'],
    min: 0,
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: 0,
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: 0,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  customLowStockThreshold: {
    type: Number,
    default: null, // null means use store default
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'disposed', 'discontinued'],
    default: 'active',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for final price
storeInventorySchema.virtual('finalPrice').get(function () {
  if (!this.sellingPrice) return 0;
  const discount = this.sellingPrice * (this.discountPercentage / 100);
  return parseFloat((this.sellingPrice - discount).toFixed(2));
});

// Virtual for profit margin
storeInventorySchema.virtual('profitMargin').get(function () {
  if (!this.buyingPrice || !this.sellingPrice) return 0;
  return parseFloat((((this.sellingPrice - this.buyingPrice) / this.buyingPrice) * 100).toFixed(2));
});

// Virtual for stock status
storeInventorySchema.virtual('stockStatus').get(function () {
  if (this.status === 'expired') return 'expired';
  if (this.stockQuantity === 0) return 'outOfStock';
  const threshold = this.customLowStockThreshold || 5;
  if (this.stockQuantity <= threshold) return 'low';
  return 'healthy';
});

// Virtual for days until expiry
storeInventorySchema.virtual('daysUntilExpiry').get(function () {
  if (!this.expiryDate) return null;
  const diff = this.expiryDate.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for expiry status
storeInventorySchema.virtual('expiryStatus').get(function () {
  const days = this.daysUntilExpiry;
  if (days === null) return 'unknown';
  if (days <= 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'warning';
  if (days <= 90) return 'approaching';
  return 'safe';
});

// Pre-save: auto-mark expired
storeInventorySchema.pre('save', function () {
  if (this.expiryDate && this.expiryDate <= new Date()) {
    this.status = 'expired';
  }
});

storeInventorySchema.index({ store: 1, medicine: 1 });
storeInventorySchema.index({ store: 1, status: 1 });
storeInventorySchema.index({ expiryDate: 1 });
storeInventorySchema.index({ stockQuantity: 1 });

const StoreInventory = mongoose.model('StoreInventory', storeInventorySchema);
export default StoreInventory;