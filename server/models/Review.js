import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  reviewText: {
    type: String,
    maxlength: 1000,
    default: '',
  },
  tags: [{
    type: String,
    enum: ['Fast Service', 'Clean Shop', 'Good Prices', 'Knowledgeable Staff', '24/7', 'Wide Selection', 'Friendly', 'Professional'],
  }],
  ownerResponse: {
    text: String,
    respondedAt: Date,
  },
  reported: {
    type: Boolean,
    default: false,
  },
  reportReason: String,
  status: {
    type: String,
    enum: ['active', 'hidden', 'removed'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// One review per store per patient per 30 days
reviewSchema.index({ store: 1, patient: 1, createdAt: -1 });
reviewSchema.index({ store: 1, status: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;