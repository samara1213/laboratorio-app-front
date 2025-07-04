import { useDispatch } from 'react-redux';
import { addOrUpdateExamResults, clearResults } from '../store/resultsSlice';

export function useResultsActions() {
  const dispatch = useDispatch();
  const saveExamResults = (results) => {
    dispatch(addOrUpdateExamResults(results));
  };
  const clearAllExamResults = () => {
    dispatch(clearResults());
  };
  return { saveExamResults, clearAllExamResults };
}
