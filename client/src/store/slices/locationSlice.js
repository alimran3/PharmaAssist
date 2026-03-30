import { createSlice } from '@reduxjs/toolkit';
import { bangladeshLocations } from '../../utils/bangladeshLocations';

const savedLocation = JSON.parse(localStorage.getItem('pharma_location') || 'null');

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    current: savedLocation || {
      division: '',
      district: '',
      upazilla: '',
      area: '',
    },
    divisions: Object.keys(bangladeshLocations),
    districts: [],
    upazillas: [],
    areas: [],
  },
  reducers: {
    setDivision: (state, action) => {
      state.current.division = action.payload;
      state.current.district = '';
      state.current.upazilla = '';
      state.current.area = '';
      state.districts = Object.keys(bangladeshLocations[action.payload] || {});
      state.upazillas = [];
      state.areas = [];
      localStorage.setItem('pharma_location', JSON.stringify(state.current));
    },
    setDistrict: (state, action) => {
      state.current.district = action.payload;
      state.current.upazilla = '';
      state.current.area = '';
      const division = bangladeshLocations[state.current.division] || {};
      state.upazillas = Object.keys(division[action.payload] || {});
      state.areas = [];
      localStorage.setItem('pharma_location', JSON.stringify(state.current));
    },
    setUpazilla: (state, action) => {
      state.current.upazilla = action.payload;
      state.current.area = '';
      const division = bangladeshLocations[state.current.division] || {};
      const district = division[state.current.district] || {};
      state.areas = district[action.payload] || [];
      localStorage.setItem('pharma_location', JSON.stringify(state.current));
    },
    setArea: (state, action) => {
      state.current.area = action.payload;
      localStorage.setItem('pharma_location', JSON.stringify(state.current));
    },
    setFullLocation: (state, action) => {
      state.current = action.payload;
      const division = bangladeshLocations[action.payload.division] || {};
      state.districts = Object.keys(division);
      const district = division[action.payload.district] || {};
      state.upazillas = Object.keys(district);
      state.areas = district[action.payload.upazilla] || [];
      localStorage.setItem('pharma_location', JSON.stringify(state.current));
    },
    clearLocation: (state) => {
      state.current = { division: '', district: '', upazilla: '', area: '' };
      state.districts = [];
      state.upazillas = [];
      state.areas = [];
      localStorage.removeItem('pharma_location');
    },
  },
});

export const { setDivision, setDistrict, setUpazilla, setArea, setFullLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;