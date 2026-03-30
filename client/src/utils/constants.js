export const MEDICINE_CATEGORIES = [
  'Painkiller', 'Antibiotic', 'Antacid', 'Antihypertensive', 'Antidiabetic',
  'Vitamin', 'Supplement', 'Dermatological', 'Ophthalmic', 'Psychiatric',
  'Cardiovascular', 'Respiratory', 'Gastrointestinal', 'Hormonal',
  'Antifungal', 'Antiviral', 'Antihistamine', 'Muscle Relaxant',
  'Antiseptic', 'IV Fluid', 'Surgical Supply', 'Baby Care',
  'Women Health', 'Other',
];

export const CATEGORY_ICONS = {
  Painkiller: '💊', Antibiotic: '🦠', Antacid: '🫗', Antihypertensive: '❤️',
  Antidiabetic: '🩸', Vitamin: '🌿', Supplement: '💪', Dermatological: '🧴',
  Ophthalmic: '👁️', Psychiatric: '🧠', Cardiovascular: '🫀', Respiratory: '🫁',
  Gastrointestinal: '🍽️', Hormonal: '⚗️', Antifungal: '🍄', Antiviral: '🛡️',
  Antihistamine: '🤧', 'Muscle Relaxant': '🦴', Antiseptic: '🧼',
  'IV Fluid': '💉', 'Surgical Supply': '🩹', 'Baby Care': '👶',
  'Women Health': '🌸', Other: '📦',
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const PAYMENT_METHODS = ['Cash', 'bKash', 'Nagad', 'Card'];

export const DOSAGE_FORMS = [
  'Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Cream',
  'Ointment', 'Gel', 'Drop', 'Inhaler', 'Suppository', 'Powder',
  'Sachet', 'Patch', 'Spray', 'Solution', 'Lotion', 'Other',
];

export const PLACEHOLDER_MEDICINE_IMG = '/placeholder-medicine.png';

export const STOCK_STATUS_CONFIG = {
  healthy: { label: 'In Stock', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgLight: 'bg-emerald-50 dark:bg-emerald-900/20' },
  low: { label: 'Low Stock', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50 dark:bg-amber-900/20' },
  outOfStock: { label: 'Out of Stock', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50 dark:bg-red-900/20' },
  expired: { label: 'Expired', color: 'bg-surface-800', textColor: 'text-surface-700', bgLight: 'bg-surface-100 dark:bg-surface-800' },
};

export const EXPIRY_STATUS_CONFIG = {
  safe: { label: 'Safe', color: 'text-emerald-600' },
  approaching: { label: 'Approaching', color: 'text-blue-600' },
  warning: { label: 'Expiring Soon', color: 'text-amber-600' },
  critical: { label: 'Critical', color: 'text-red-600' },
  expired: { label: 'Expired', color: 'text-surface-500' },
};