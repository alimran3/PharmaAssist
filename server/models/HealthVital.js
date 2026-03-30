import mongoose from 'mongoose';

const healthVitalSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['bloodPressure', 'heartRate', 'bloodSugar', 'bloodOxygen', 'temperature', 'weight', 'symptom'],
    required: true,
  },

  // Blood Pressure
  systolic: Number,
  diastolic: Number,

  // Heart Rate
  bpm: Number,
  context: {
    type: String,
    enum: ['Resting', 'Active', 'Post-Exercise', ''],
    default: '',
  },

  // Blood Sugar
  sugarType: {
    type: String,
    enum: ['Fasting', 'After Meal', 'Random', 'HbA1c', ''],
    default: '',
  },
  sugarValue: Number,

  // Blood Oxygen
  spo2: Number,

  // Temperature
  temperatureValue: Number,
  temperatureUnit: {
    type: String,
    enum: ['F', 'C'],
    default: 'F',
  },

  // Weight
  weightValue: Number,

  // Symptom
  symptomName: String,
  symptomSeverity: {
    type: String,
    enum: ['Mild', 'Moderate', 'Severe', ''],
    default: '',
  },
  symptomTrigger: String,
  symptomPhotoUrl: String,

  notes: String,
  recordedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for BP category
healthVitalSchema.virtual('bpCategory').get(function () {
  if (this.type !== 'bloodPressure' || !this.systolic || !this.diastolic) return null;
  if (this.systolic < 120 && this.diastolic < 80) return 'Normal';
  if (this.systolic < 130 && this.diastolic < 80) return 'Elevated';
  if (this.systolic < 140 || this.diastolic < 90) return 'High Stage 1';
  if (this.systolic >= 140 || this.diastolic >= 90) return 'High Stage 2';
  if (this.systolic >= 180 || this.diastolic >= 120) return 'Crisis';
  return 'Unknown';
});

// Virtual for sugar category
healthVitalSchema.virtual('sugarCategory').get(function () {
  if (this.type !== 'bloodSugar' || !this.sugarValue) return null;
  if (this.sugarType === 'Fasting') {
    if (this.sugarValue < 100) return 'Normal';
    if (this.sugarValue < 126) return 'Pre-Diabetic';
    return 'Diabetic';
  }
  if (this.sugarType === 'After Meal') {
    if (this.sugarValue < 140) return 'Normal';
    if (this.sugarValue < 200) return 'Pre-Diabetic';
    return 'Diabetic';
  }
  return 'Recorded';
});

healthVitalSchema.index({ patient: 1, type: 1, recordedAt: -1 });

const HealthVital = mongoose.model('HealthVital', healthVitalSchema);
export default HealthVital;