import express from 'express';
import { protect } from '../middleware/auth.js';
import { isStoreOwner } from '../middleware/roleGuard.js';
import Store from '../models/Store.js';
import StoreInventory from '../models/StoreInventory.js';
import Bill from '../models/Bill.js';

const router = express.Router();

// Get nearby pharmacies (public)
router.get('/nearby', async (req, res, next) => {
  try {
    const { division, district, upazilla, area, search, page = 1, limit = 20 } = req.query;

    const filter = { status: 'active' };
    if (division) filter['appAddress.division'] = division;
    if (district) filter['appAddress.district'] = district;
    if (upazilla) filter['appAddress.upazilla'] = upazilla;
    if (area) filter['appAddress.area'] = area;
    if (search) {
      filter.$or = [
        { pharmacyName: { $regex: search, $options: 'i' } },
        { exactAddress: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Store.countDocuments(filter);
    const stores = await Store.find(filter)
      .populate('owner', 'fullName phone email')
      .sort({ averageRating: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        stores,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single store public profile
router.get('/:id/public', async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id).populate('owner', 'fullName');
    if (!store || store.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Pharmacy not found.' });
    }

    const medicineCount = await StoreInventory.countDocuments({
      store: store._id,
      status: 'active',
      stockQuantity: { $gt: 0 },
    });

    res.json({
      success: true,
      data: { store, medicineCount },
    });
  } catch (error) {
    next(error);
  }
});

// Get store medicines (public)
router.get('/:id/medicines', async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });

    const filter = {
      store: store._id,
      status: 'active',
      stockQuantity: { $gt: 0 },
      expiryDate: { $gt: new Date() },
    };

    const MasterMedicine = (await import('../models/MasterMedicine.js')).default;

    if (category || search) {
      const medFilter = { status: 'Active' };
      if (category) medFilter.category = category;
      if (search) {
        medFilter.$or = [
          { brandName: { $regex: search, $options: 'i' } },
          { genericName: { $regex: search, $options: 'i' } },
        ];
      }
      const medIds = await MasterMedicine.find(medFilter).distinct('_id');
      filter.medicine = { $in: medIds };
    }

    const total = await StoreInventory.countDocuments(filter);
    const medicines = await StoreInventory.find(filter)
      .populate('medicine')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        medicines,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Store owner: update store info
router.put('/my-store', protect, isStoreOwner, async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });

    const allowed = [
      'pharmacyName', 'drugLicenseNumber', 'tradeLicenseNumber',
      'establishmentYear', 'logoUrl', 'coverPhotoUrl',
      'appAddress', 'exactAddress', 'operatingHours',
      'lowStockThreshold', 'billSettings', 'phone',
    ];

    for (const field of allowed) {
      if (req.body[field] !== undefined) store[field] = req.body[field];
    }

    await store.save();
    res.json({ success: true, message: 'Store updated.', data: { store } });
  } catch (error) {
    next(error);
  }
});

// Store dashboard stats
router.get('/my-store/stats', protect, isStoreOwner, async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalMedicines,
      lowStockCount,
      outOfStockCount,
      expiringSoonCount,
      expiredCount,
      todaySales,
      monthSales,
      recentBills,
    ] = await Promise.all([
      StoreInventory.countDocuments({ store: store._id, status: 'active' }),
      StoreInventory.countDocuments({ store: store._id, status: 'active', stockQuantity: { $gt: 0, $lte: store.lowStockThreshold } }),
      StoreInventory.countDocuments({ store: store._id, status: 'active', stockQuantity: 0 }),
      StoreInventory.countDocuments({
        store: store._id, status: 'active',
        expiryDate: { $gt: new Date(), $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      }),
      StoreInventory.countDocuments({ store: store._id, status: 'expired' }),
      Bill.aggregate([
        { $match: { store: store._id, createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
      ]),
      Bill.aggregate([
        { $match: { store: store._id, createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
      ]),
      Bill.find({ store: store._id }).sort({ createdAt: -1 }).limit(10).populate('patient', 'fullName phone'),
    ]);

    res.json({
      success: true,
      data: {
        totalMedicines,
        lowStockCount,
        outOfStockCount,
        expiringSoonCount,
        expiredCount,
        todaySales: todaySales[0] || { total: 0, count: 0 },
        monthSales: monthSales[0] || { total: 0, count: 0 },
        recentBills,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;