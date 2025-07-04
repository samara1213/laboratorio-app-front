// Barrel file para store
export { store } from './store';
export { default as authReducer, loginSuccess, logout } from './authSlice';
export { default as resultsReducer, setCompletedExams, addOrUpdateExamResults, clearResults } from './resultsSlice';
