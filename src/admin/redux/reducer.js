export const initialState = {
    isOpen: false, 
    deleteProcessType: null,
    deleteStep: null, 
};
 
function Reducer(state = initialState, action) {
    switch (action.type) {
      case 'OPEN_MODAL_PROCESS_TYPE':
        return { ...state, isOpen: true, deleteProcessType: action.payload };
      case 'OPEN_MODAL_STEP':
        return { ...state, isOpen: true, deleteStep: action.payload };
      case 'CLOSE_MODAL':
        return { ...state, isOpen: false, deleteProcessType: null, deleteStep: null };
      default:
        return state;
    }
}
 
export default Reducer;