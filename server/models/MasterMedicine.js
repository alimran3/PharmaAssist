import mongoose from 'mongoose';

const masterMedicineSchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true,
    index: true,
  },
  genericName: {
    type: String,
    required: [true, 'Generic name is required'],
    trim: true,
    index: true,
  },
  manufacturer: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: String,
    enum: [
      'Painkiller', 'Antibiotic', 'Antacid', 'Antihypertensive', 'Antidiabetic',
      'Vitamin', 'Supplement', 'Dermatological', 'Ophthalmic', 'Psychiatric',
      'Cardiovascular', 'Respiratory', 'Gastrointestinal', 'Hormonal',
      'Antifungal', 'Antiviral', 'Antihistamine', 'Muscle Relaxant',
      'Antiseptic', 'IV Fluid', 'Surgical Supply', 'Baby Care',
      'Women Health', 'Other',
    ],
    default: 'Other',
  },
  dosageForm: {
    type: String,
    enum: [
      'Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Cream',
      'Ointment', 'Gel', 'Drop', 'Inhaler', 'Suppository', 'Powder',
      'Sachet', 'Patch', 'Spray', 'Solution', 'Lotion', 'Other',
    ],
    default: 'Tablet',
  },
  strength: {
    type: String,
    trim: true,
    default: '',
  },
  standardMrp: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    default: '',
  },
  sideEffects: [{
    type: String,
    trim: true,
  }],
  contraindications: {
    conflictingConditions: [{ type: String }],
    conflictingDrugs: [{ type: String }],
    allergyTriggers: [{ type: String }],
  },
  usageInstructions: {
    type: String,
    default: '',
  },
  ageRestriction: {
    minAge: { type: Number, default: 0 },
    maxAge: { type: Number, default: 150 },
    note: String,
  },
  prescriptionRequired: {
    type: Boolean,
    default: false,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Active', 'Discontinued'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

// Text search index
masterMedicineSchema.index({
  brandName: 'text',
  genericName: 'text',
  manufacturer: 'text',
  category: 'text',
});

masterMedicineSchema.index({ category: 1, dosageForm: 1 });
masterMedicineSchema.index({ status: 1 });

const MasterMedicine = mongoose.model('MasterMedicine', masterMedicineSchema);
export default MasterMedicine;