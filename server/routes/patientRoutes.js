import express from 'express';
import { protect } from '../middleware/auth.js';
import { isStoreOwner } from '../middleware/roleGuard.js';
import User from '../models/User.js';
import Prescription from '../models/Prescription.js';

const router = express.Router();

// Store owner: search patient by phone/name (for bill linking)
router.get('/search', protect, isStoreOwner, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 3) {
      return res.json({ success: true, data: { patients: [] } });
    }

    const patients = await User.find({
      role: 'patient',
      status: 'active',
      $or: [
        { phone: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    })
      .select('fullName phone email dateOfBirth gender bloodGroup allergies medicalConditions pregnancyStatus appAddress')
      .limit(10);

    res.json({ success: true, data: { patients } });
  } catch (error) {
    next(error);
  }
});

// Patient: prescriptions CRUD
router.post('/prescriptions', protect, async (req, res, next) => {
  try {
    const prescription = await Prescription.create({
      patient: req.user._id,
      ...req.body,
    });
    res.status(201).json({ success: true, data: { prescription } });
  } catch (error) {
    next(error);
  }
});

router.get('/prescriptions', protect, async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { prescriptions } });
  } catch (error) {
    next(error);
  }
});

router.put('/prescriptions/:id', protect, async (req, res, next) => {
  try {
    const prescription = await Prescription.findOneAndUpdate(
      { _id: req.params.id, patient: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found.' });
    res.json({ success: true, data: { prescription } });
  } catch (error) {
    next(error);
  }
});

router.delete('/prescriptions/:id', protect, async (req, res, next) => {
  try {
    const prescription = await Prescription.findOneAndDelete({ _id: req.params.id, patient: req.user._id });
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found.' });
    res.json({ success: true, message: 'Prescription deleted.' });
  } catch (error) {
    next(error);
  }
});

export default router;