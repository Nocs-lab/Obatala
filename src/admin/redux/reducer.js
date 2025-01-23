export const initialState = {
    isOpen: false, 
    processModel: null,
    sector: null,
    user: null 
};
 
function Reducer(state = initialState, action) {
    switch (action.type) {
      case 'OPEN_MODAL_PROCESS_MODEL':
        return { ...state, isOpen: true, processModel: action.payload };
      case 'OPEN_MODAL_SECTOR':
        return { ...state, isOpen: true, sector: action.payload };
      case 'OPEN_MODAL_USER':
        return { ...state, isOpen: true, user: action.payload };
      case 'CLOSE_MODAL':
        return { ...state, isOpen: false, processModel: null, sector: null, user: null };
      default:
        return state;
    }
}
 
export default Reducer;