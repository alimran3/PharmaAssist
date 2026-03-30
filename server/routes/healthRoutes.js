import express from 'express';
import { protect } from '../middleware/auth.js';
import { isPatient } from '../middleware/roleGuard.js';
import HealthVital from '../models/HealthVital.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Log a new vital reading
router.post('/vitals', protect, isPatient, async (req, res, next) => {
  try {
    const vitalData = { ...req.body, patient: req.user._id };
    const vital = await HealthVital.create(vitalData);

    // Auto health alerts
    const alerts = [];
    if (vital.type === 'bloodPressure') {
      if (vital.systolic >= 140 || vital.diastolic >= 90) {
        alerts.push(`Your BP reading (${vital.systolic}/${vital.diastolic}) is HIGH. Consider consulting a doctor.`);
      }
      if (vital.systolic >= 180 || vital.diastolic >= 120) {
        alerts.push(`CRITICAL: Your BP reading (${vital.systolic}/${vital.diastolic}) indicates a hypertensive crisis. Seek immediate medical attention.`);
      }
    }
    if (vital.type === 'bloodSugar') {
      if (vital.sugarType === 'Fasting' && vital.sugarValue >= 126) {
        alerts.push(`Your fasting blood sugar (${vital.sugarValue} mg/dL) is in the diabetic range.`);
      }
      if (vital.sugarValue >= 300) {
        alerts.push(`CRITICAL: Blood sugar is extremely high (${vital.sugarValue} mg/dL). Seek medical attention.`);
      }
    }
    if (vital.type === 'bloodOxygen' && vital.spo2 < 92) {
      alerts.push(`Your SpO2 (${vital.spo2}%) is dangerously low. Seek immediate medical attention.`);
    }
    if (vital.type === 'temperature') {
      const tempF = vital.temperatureUnit === 'C' ? (vital.temperatureValue * 9 / 5) + 32 : vital.temperatureValue;
      if (tempF >= 103) {
        alerts.push(`High fever detected (${vital.temperatureValue}°${vital.temperatureUnit}). Consider consulting a doctor.`);
      }
    }

    for (const alertMsg of alerts) {
      await Notification.create({
        recipient: req.user._id,
        type: 'healthAlert',
        title: 'Health Alert',
        message: alertMsg,
        priority: 'high',
      });
    }

    res.status(201).json({ success: true, data: { vital, alerts } });
  } catch (error) {
    next(error);
  }
});

// Get vitals by type
router.get('/vitals', protect, isPatient, async (req, res, next) => {
  try {
    const { type, limit = 50, dateFrom, dateTo } = req.query;

    const filter = { patient: req.user._id };
    if (type) filter.type = type;
    if (dateFrom || dateTo) {
      filter.recordedAt = {};
      if (dateFrom) filter.recordedAt.$gte = new Date(dateFrom);
      if (dateTo) filter.recordedAt.$lte = new Date(dateTo);
    }

    const vitals = await HealthVital.find(filter)
      .sort({ recordedAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: { vitals } });
  } catch (error) {
    next(error);
  }
});

// Delete vital
router.delete('/vitals/:id', protect, isPatient, async (req, res, next) => {
  try {
    const vital = await HealthVital.findOneAndDelete({ _id: req.params.id, patient: req.user._id });
    if (!vital) return res.status(404).json({ success: false, message: 'Vital record not found.' });
    res.json({ success: true, message: 'Vital record deleted.' });
  } catch (error) {
    next(error);
  }
});

// Health summary
router.get('/summary', protect, isPatient, async (req, res, next) => {
  try {
    const types = ['bloodPressure', 'heartRate', 'bloodSugar', 'bloodOxygen', 'temperature', 'weight'];
    const summary = {};

    for (const type of types) {
      const latest = await HealthVital.findOne({ patient: req.user._id, type }).sort({ recordedAt: -1 });
      summary[type] = latest || null;
    }

    const recentSymptoms = await HealthVital.find({ patient: req.user._id, type: 'symptom' })
      .sort({ recordedAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        summary,
        recentSymptoms,
        user: {
          height: req.user.height,
          weight: req.user.weight,
          bmi: req.user.bmi,
          bloodGroup: req.user.bloodGroup,
          allergies: req.user.allergies,
          medicalConditions: req.user.medicalConditions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;