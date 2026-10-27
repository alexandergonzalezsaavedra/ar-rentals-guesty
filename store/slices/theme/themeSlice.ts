import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Theme {
  theme: string;
}

const initialState: Theme = {
  theme: 'light',
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
