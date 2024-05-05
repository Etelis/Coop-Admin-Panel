// src/redux/actions.js
export const setExperimenterInfo = (data) => ({
    type: 'SET_EXPERIMENTER_INFO',
    payload: data
});

// src/redux/reducers.js
const initialState = {
    isAuthenticated: false,
    experimenterInfo: null
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_EXPERIMENTER_INFO':
            return {
                ...state,
                isAuthenticated: true,
                experimenterInfo: action.payload
            };
        default:
            return state;
    }
};

export default authReducer;
