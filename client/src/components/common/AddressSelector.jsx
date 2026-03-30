import { useEffect } from 'react';
import { getDivisions, getDistricts, getUpazillas, getAreas } from '../../utils/bangladeshLocations';

export default function AddressSelector({ value = {}, onChange, showArea = true, className = '' }) {
  const divisions = getDivisions();
  const districts = value.division ? getDistricts(value.division) : [];
  const upazillas = value.division && value.district ? getUpazillas(value.division, value.district) : [];
  const areas = value.division && value.district && value.upazilla ? getAreas(value.division, value.district, value.upazilla) : [];

  const handleChange = (field, val) => {
    const newValue = { ...value };
    newValue[field] = val;
    if (field === 'division') { newValue.district = ''; newValue.upazilla = ''; newValue.area = ''; }
    if (field === 'district') { newValue.upazilla = ''; newValue.area = ''; }
    if (field === 'upazilla') { newValue.area = ''; }
    onChange(newValue);
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
      {/* Division */}
      <div>
        <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Division</label>
        <select
          value={value.division || ''}
          onChange={(e) => handleChange('division', e.target.value)}
          className="input-field"
        >
          <option value="">Select Division</option>
          {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* District */}
      <div>
        <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">District</label>
        <select
          value={value.district || ''}
          onChange={(e) => handleChange('district', e.target.value)}
          className="input-field"
          disabled={!value.division}
        >
          <option value="">Select District</option>
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Upazilla */}
      <div>
        <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Upazilla / Thana</label>
        <select
          value={value.upazilla || ''}
          onChange={(e) => handleChange('upazilla', e.target.value)}
          className="input-field"
          disabled={!value.district}
        >
          <option value="">Select Upazilla</option>
          {upazillas.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {/* Area */}
      {showArea && (
        <div>
          <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Area / Locality</label>
          <select
            value={value.area || ''}
            onChange={(e) => handleChange('area', e.target.value)}
            className="input-field"
            disabled={!value.upazilla}
          >
            <option value="">Select Area</option>
            {areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}