import express from 'express';
import {
  createBill,
  getStoreBills,
  getBillById,
  getPatientPurchaseHistory,
  downloadBillPDF,
} from '../controllers/billController.js';
import { protect } from '../middleware/auth.js';
import { isStoreOwner, isPatient } from '../middleware/roleGuard.js';

const router = express.Router();

// Store owner routes
router.post('/', protect, isStoreOwner, createBill);
router.get('/store', protect, isStoreOwner, getStoreBills);
router.get('/:id/pdf', protect, downloadBillPDF);

// Patient routes
router.get('/my-purchases', protect, isPatient, getPatientPurchaseHistory);

// Shared route
router.get('/:id', protect, getBillById);

export default router;