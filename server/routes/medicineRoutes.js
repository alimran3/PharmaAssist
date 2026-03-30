import express from 'express';
import {
  searchMedicines,
  getMedicineById,
  getCategories,
  getAutocompleteSuggestions,
} from '../controllers/medicineController.js';

const router = express.Router();

router.get('/search', searchMedicines);
router.get('/autocomplete', getAutocompleteSuggestions);
router.get('/categories', getCategories);
router.get('/:id', getMedicineById);

export default router;