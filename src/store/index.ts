import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from './dashboardSlice'
import uploadReducer from './uploadSlice'

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    upload: uploadReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
