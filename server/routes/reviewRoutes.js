import express from 'express';
import { protect } from '../middleware/auth.js';
import Review from '../models/Review.js';
import Store from '../models/Store.js';
import Bill from '../models/Bill.js';

const router = express.Router();

// Create review
router.post('/', protect, async (req, res, next) => {
  try {
    const { storeId, billId, rating, reviewText, tags } = req.body;

    const bill = await Bill.findOne({ _id: billId, patient: req.user._id, store: storeId });
    if (!bill) {
      return res.status(400).json({ success: false, message: 'You can only review pharmacies where you have made a purchase.' });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentReview = await Review.findOne({
      store: storeId,
      patient: req.user._id,
      createdAt: { $gte: thirtyDaysAgo },
    });

    if (recentReview) {
      return res.status(400).json({ success: false, message: 'You can only review a pharmacy once every 30 days.' });
    }

    const review = await Review.create({
      store: storeId,
      patient: req.user._id,
      bill: billId,
      rating,
      reviewText,
      tags,
    });

    // Update store average rating
    const allReviews = await Review.find({ store: storeId, status: 'active' });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Store.findByIdAndUpdate(storeId, {
      averageRating: parseFloat(avgRating.toFixed(1)),
      totalReviews: allReviews.length,
    });

    await review.populate('patient', 'fullName photoUrl');

    res.status(201).json({ success: true, data: { review } });
  } catch (error) {
    next(error);
  }
});

// Get reviews for a store
router.get('/store/:storeId', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = { store: req.params.storeId, status: 'active' };

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('patient', 'fullName photoUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { reviews, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    next(error);
  }
});

// Store owner respond to review
router.put('/:id/respond', protect, async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });

    const review = await Review.findOne({ _id: req.params.id, store: store._id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    review.ownerResponse = { text: req.body.responseText, respondedAt: new Date() };
    await review.save();

    res.json({ success: true, data: { review } });
  } catch (error) {
    next(error);
  }
});

// Report review
router.put('/:id/report', protect, async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { reported: true, reportReason: req.body.reason },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, message: 'Review reported for moderation.' });
  } catch (error) {
    next(error);
  }
});

export default router;