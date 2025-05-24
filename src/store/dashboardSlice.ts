import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface FilterState {
  category: string;
  search: string;
  minValue: number | null;
  maxValue: number | null;
}

interface DashboardState {
  filters: FilterState;
  year: number;
  totalRecords: number;
  categoriesCount: number;
}

const initialState: DashboardState = {
  filters: {
    category: 'All Categories',
    search: '',
    minValue: null,
    maxValue: null,
  },
  year: 2025,
  totalRecords: 0,
  categoriesCount: 0,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<FilterState>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters(state) {
      state.filters = initialState.filters
    },
    setYear(state, action: PayloadAction<number>) {
      state.year = action.payload
    },
    setTotalRecords(state, action: PayloadAction<number>) {
      state.totalRecords = action.payload
    },
    setCategoriesCount(state, action: PayloadAction<number>) {
      state.categoriesCount = action.payload
    },
  },
})

export const { 
  setFilters, 
  resetFilters, 
  setYear, 
  setTotalRecords,
  setCategoriesCount,
} = dashboardSlice.actions

export default dashboardSlice.reducer
