const initialState = {
    isOpen: false,
    deleteSector: null,
};

function Reducer(state, action) {
    switch (action.type) {
        case 'OPEN_MODAL_SECTOR':
            return { ...state, isOpen: true, deleteSector: action.payload };
        case 'CLOSE_MODAL':
            return { ...state, isOpen: false, deleteSector: null };
        default:
            return state;
    }
}

export { initialState };
export default Reducer;
