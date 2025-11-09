import type { SalesData, ValidationError } from '@/lib/types/chart';
import { create } from 'zustand';

interface ChartStore {
  // Data state
  data: SalesData[];

  // UI state
  isLoading: boolean;
  errors: ValidationError[];

  // Actions
  setData: (data: SalesData[]) => void;

  // Error management
  setErrors: (errors: ValidationError[]) => void;
  clearErrors: () => void;

  // Loading state
  setIsLoading: (loading: boolean) => void;
}

export const useChartStore = create<ChartStore>((set) => ({
  // Initial state
  data: [],
  isLoading: false,
  errors: [],

  // Data operations
  setData: (data) => set({
    data,
    errors: [] // Clear errors on new data
  }),

  // Error management
  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: [] }),

  // Loading state
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

