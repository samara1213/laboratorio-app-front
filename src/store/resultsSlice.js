import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  completedExams: [], // [{ exa_id, par_id, resultado, observacion }]
};

const resultsSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    setCompletedExams(state, action) {
      state.completedExams = action.payload;
    },
    addOrUpdateExamResults(state, action) {
      // action.payload: array de resultados para un examen
      const newResults = action.payload;
      if (!Array.isArray(newResults) || newResults.length === 0) return;
      const exa_id = newResults[0].exa_id;
      // Eliminar previos de ese examen
      state.completedExams = state.completedExams.filter(r => r.exa_id !== exa_id);
      // Agregar los nuevos
      state.completedExams = [...state.completedExams, ...newResults];
    },
    clearResults(state) {
      state.completedExams = [];
    },
  },
});

export const { setCompletedExams, addOrUpdateExamResults, clearResults } = resultsSlice.actions;
export default resultsSlice.reducer;
