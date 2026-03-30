import Bill from '../models/Bill.js';

/**
 * Checks for drug conflicts based on patient profile.
 * Returns array of warning objects.
 */
export const checkConflicts = async (patient, medicine) => {
  const warnings = [];

  if (!patient || !medicine) return warnings;

  // CHECK 1: ALLERGY CHECK
  if (patient.allergies && patient.allergies.length > 0 && medicine.contraindications?.allergyTriggers) {
    for (const allergy of patient.allergies) {
      const allergyName = allergy.name.toLowerCase();
      for (const trigger of medicine.contraindications.allergyTriggers) {
        if (trigger.toLowerCase().includes(allergyName) || allergyName.includes(trigger.toLowerCase())) {
          warnings.push({
            type: 'allergy',
            severity: 'red',
            message: `DANGER — Patient is allergic to ${allergy.name}. ${medicine.brandName} contains ${trigger}. DO NOT SELL.`,
          });
        }
      }
    }
  }

  // CHECK 2: DRUG-DRUG INTERACTION CHECK
  if (patient.currentMedicines && patient.currentMedicines.length > 0 && medicine.contraindications?.conflictingDrugs) {
    for (const currentMed of patient.currentMedicines) {
      const currentGeneric = (currentMed.genericName || currentMed.brandName || '').toLowerCase();
      const currentBrand = (currentMed.brandName || '').toLowerCase();
      for (const conflictDrug of medicine.contraindications.conflictingDrugs) {
        const conflictLower = conflictDrug.toLowerCase();
        if (currentGeneric.includes(conflictLower) || currentBrand.includes(conflictLower) || conflictLower.includes(currentGeneric)) {
          warnings.push({
            type: 'drugDrug',
            severity: 'red',
            message: `WARNING — ${medicine.brandName} may interact with ${currentMed.brandName || currentGeneric} (${conflictDrug}).`,
          });
        }
      }
    }
  }

  // CHECK 3: CONDITION CONFLICT CHECK
  if (patient.medicalConditions && patient.medicalConditions.length > 0 && medicine.contraindications?.conflictingConditions) {
    for (const condition of patient.medicalConditions) {
      if (condition.status !== 'Active') continue;
      const condName = condition.name.toLowerCase();
      for (const conflictCond of medicine.contraindications.conflictingConditions) {
        if (condName.includes(conflictCond.toLowerCase()) || conflictCond.toLowerCase().includes(condName)) {
          warnings.push({
            type: 'condition',
            severity: 'yellow',
            message: `CAUTION — Patient has ${condition.name}. ${medicine.brandName} may be contraindicated for this condition.`,
          });
        }
      }
    }
  }

  // CHECK 4: AGE RESTRICTION CHECK
  if (patient.dateOfBirth && medicine.ageRestriction) {
    const age = Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    if (medicine.ageRestriction.minAge && age < medicine.ageRestriction.minAge) {
      warnings.push({
        type: 'age',
        severity: 'yellow',
        message: `Not recommended for patients under ${medicine.ageRestriction.minAge}. Patient age: ${age}.${medicine.ageRestriction.note ? ' ' + medicine.ageRestriction.note : ''}`,
      });
    }
    if (medicine.ageRestriction.maxAge && age > medicine.ageRestriction.maxAge) {
      warnings.push({
        type: 'age',
        severity: 'yellow',
        message: `Not recommended for patients over ${medicine.ageRestriction.maxAge}. Patient age: ${age}.`,
      });
    }
  }

  // CHECK 5: PREGNANCY CHECK
  if (patient.pregnancyStatus === 'Pregnant' || patient.pregnancyStatus === 'Breastfeeding') {
    if (medicine.contraindications?.conflictingConditions) {
      const pregConflict = medicine.contraindications.conflictingConditions.some((c) =>
        c.toLowerCase().includes('pregnan') || c.toLowerCase().includes('breastfeed')
      );
      if (pregConflict) {
        warnings.push({
          type: 'pregnancy',
          severity: 'red',
          message: `DANGER — Contraindicated during ${patient.pregnancyStatus.toLowerCase()}. DO NOT SELL without doctor approval.`,
        });
      }
    }
  }

  // CHECK 6: DUPLICATE MEDICINE CHECK
  const recentPurchaseDate = new Date();
  recentPurchaseDate.setDate(recentPurchaseDate.getDate() - 7);

  const recentBills = await Bill.find({
    patient: patient._id,
    createdAt: { $gte: recentPurchaseDate },
    'items.medicine': medicine._id,
  });

  if (recentBills.length > 0) {
    const lastPurchase = recentBills[0];
    const daysAgo = Math.ceil((Date.now() - lastPurchase.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    warnings.push({
      type: 'duplicate',
      severity: 'yellow',
      message: `Patient purchased ${medicine.brandName} ${daysAgo} day(s) ago from another pharmacy. Possible duplicate.`,
    });
  }

  return warnings;
};