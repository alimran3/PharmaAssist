import express from 'express';
import {
  addToInventory,
  getStoreInventory,
  updateInventoryItem,
  restockMedicine,
  deleteInventoryItem,
  getMedicinesByLocation,
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/auth.js';
import { isStoreOwner } from '../middleware/roleGuard.js';

const router = express.Router();

// Public/Patient routes
router.get('/browse', getMedicinesByLocation);

// Store owner routes
router.post('/', protect, isStoreOwner, addToInventory);
router.get('/my-store', protect, isStoreOwner, getStoreInventory);
router.put('/:id', protect, isStoreOwner, updateInventoryItem);
router.patch('/:id/restock', protect, isStoreOwner, restockMedicine);
router.delete('/:id', protect, isStoreOwner, deleteInventoryItem);

export default router;