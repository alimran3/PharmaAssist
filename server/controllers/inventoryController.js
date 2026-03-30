import StoreInventory from '../models/StoreInventory.js';
import Store from '../models/Store.js';
import MasterMedicine from '../models/MasterMedicine.js';
import Notification from '../models/Notification.js';

// Add medicine to store inventory
export const addToInventory = async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    const {
      medicineId, batchNumber, buyingDate, expiryDate,
      buyingPrice, sellingPrice, discountPercentage,
      stockQuantity, imageUrl, notes,
    } = req.body;

    // Validate medicine exists
    const medicine = await MasterMedicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found in master database.' });
    }

    // Check expiry date
    const expiry = new Date(expiryDate);
    if (expiry <= new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot add expired medicine. Expiry date has already passed.' });
    }

    // Check for warnings
    const warnings = [];
    const daysUntilExpiry = Math.ceil((expiry - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 30) {
      warnings.push(`Warning: This medicine expires in ${daysUntilExpiry} days.`);
    }

    const inventoryItem = await StoreInventory.create({
      store: store._id,
      medicine: medicineId,
      batchNumber,
      buyingDate,
      expiryDate,
      buyingPrice,
      sellingPrice,
      discountPercentage: discountPercentage || 0,
      stockQuantity,
      imageUrl,
      notes,
    });

    await inventoryItem.populate('medicine');

    res.status(201).json({
      success: true,
      message: 'Medicine added to inventory successfully.',
      data: { inventoryItem, warnings },
    });
  } catch (error) {
    next(error);
  }
};

// Get store inventory
export const getStoreInventory = async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    const {
      category, status, expiryWithin, sortBy = 'createdAt',
      sortOrder = 'desc', search, page = 1, limit = 20,
    } = req.query;

    const filter = { store: store._id };

    if (status) {
      switch (status) {
        case 'inStock':
          filter.stockQuantity = { $gt: store.lowStockThreshold };
          filter.status = 'active';
          break;
        case 'low':
          filter.stockQuantity = { $gt: 0, $lte: store.lowStockThreshold };
          filter.status = 'active';
          break;
        case 'outOfStock':
          filter.stockQuantity = 0;
          filter.status = 'active';
          break;
        case 'expired':
          filter.status = 'expired';
          break;
      }
    }

    if (expiryWithin) {
      const days = parseInt(expiryWithin);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      filter.expiryDate = { $lte: futureDate, $gt: new Date() };
      filter.status = 'active';
    }

    let query = StoreInventory.find(filter).populate('medicine');

    // Filter by medicine category
    if (category) {
      const medicineIds = await MasterMedicine.find({ category }).distinct('_id');
      filter.medicine = { $in: medicineIds };
      query = StoreInventory.find(filter).populate('medicine');
    }

    // Search within inventory
    if (search) {
      const medicineIds = await MasterMedicine.find({
        $or: [
          { brandName: { $regex: search, $options: 'i' } },
          { genericName: { $regex: search, $options: 'i' } },
        ],
      }).distinct('_id');
      filter.medicine = { $in: medicineIds };
      query = StoreInventory.find(filter).populate('medicine');
    }

    const total = await StoreInventory.countDocuments(filter);

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const inventory = await query
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get summary stats
    const stats = await StoreInventory.aggregate([
      { $match: { store: store._id } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalStock: { $sum: '$stockQuantity' },
          outOfStock: { $sum: { $cond: [{ $eq: ['$stockQuantity', 0] }, 1, 0] } },
          lowStock: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$stockQuantity', 0] }, { $lte: ['$stockQuantity', store.lowStockThreshold] }] },
                1,
                0,
              ],
            },
          },
          expired: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        inventory,
        stats: stats[0] || { totalItems: 0, totalStock: 0, outOfStock: 0, lowStock: 0, expired: 0 },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update inventory item
export const updateInventoryItem = async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    const item = await StoreInventory.findOne({ _id: req.params.id, store: store._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }

    const allowedUpdates = [
      'batchNumber', 'buyingDate', 'expiryDate', 'buyingPrice',
      'sellingPrice', 'discountPercentage', 'stockQuantity',
      'imageUrl', 'notes', 'customLowStockThreshold', 'status',
    ];

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    }

    await item.save();
    await item.populate('medicine');

    res.json({
      success: true,
      message: 'Inventory item updated.',
      data: { inventoryItem: item },
    });
  } catch (error) {
    next(error);
  }
};

// Restock medicine
export const restockMedicine = async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    const { additionalQuantity } = req.body;
    if (!additionalQuantity || additionalQuantity < 1) {
      return res.status(400).json({ success: false, message: 'Please provide a valid quantity to add.' });
    }

    const item = await StoreInventory.findOne({ _id: req.params.id, store: store._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }

    item.stockQuantity += additionalQuantity;
    await item.save();
    await item.populate('medicine');

    res.json({
      success: true,
      message: `Restocked ${additionalQuantity} units. New total: ${item.stockQuantity}.`,
      data: { inventoryItem: item },
    });
  } catch (error) {
    next(error);
  }
};

// Delete inventory item
export const deleteInventoryItem = async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    const item = await StoreInventory.findOneAndDelete({ _id: req.params.id, store: store._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }

    res.json({ success: true, message: 'Inventory item removed.' });
  } catch (error) {
    next(error);
  }
};

// Patient-facing: Get medicines by location
export const getMedicinesByLocation = async (req, res, next) => {
  try {
    const { division, district, upazilla, area, category, search, sort, page = 1, limit = 20 } = req.query;

    // Find stores matching location
    const storeFilter = { status: 'active' };
    if (division) storeFilter['appAddress.division'] = division;
    if (district) storeFilter['appAddress.district'] = district;
    if (upazilla) storeFilter['appAddress.upazilla'] = upazilla;
    if (area) storeFilter['appAddress.area'] = area;

    const storeIds = await Store.find(storeFilter).distinct('_id');

    // Find inventory
    const invFilter = {
      store: { $in: storeIds },
      status: 'active',
      stockQuantity: { $gt: 0 },
      expiryDate: { $gt: new Date() },
    };

    if (category) {
      const medIds = await MasterMedicine.find({ category, status: 'Active' }).distinct('_id');
      invFilter.medicine = { $in: medIds };
    }

    if (search) {
      const medIds = await MasterMedicine.find({
        $or: [
          { brandName: { $regex: search, $options: 'i' } },
          { genericName: { $regex: search, $options: 'i' } },
        ],
        status: 'Active',
      }).distinct('_id');
      invFilter.medicine = { ...(invFilter.medicine || {}), $in: medIds };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'cheapest') sortOptions = { sellingPrice: 1 };
    if (sort === 'name') sortOptions = { 'medicine.brandName': 1 };

    const total = await StoreInventory.countDocuments(invFilter);

    const inventory = await StoreInventory.find(invFilter)
      .populate('medicine')
      .populate({ path: 'store', select: 'pharmacyName appAddress exactAddress phone operatingHours logoUrl averageRating' })
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        medicines: inventory,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};