import { useState, createContext, useContext } from "react";

// Define the context with an initial structure
const StateContext = createContext({
    user: {},
    token: null,
    singleTransaction: null,
    setUser: () => { },
    setToken: () => { },
    setSingleTransaction: () => { }
});

// Define the provider component
export const ContextProvider = ({ children }) => {
    const [user, setUser] = useState({});
    const [token, _setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));
    const [singleTransaction, setSingleTransaction] = useState(null);

    // Function to set the token and manage local storage
    const setToken = (token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem('ACCESS_TOKEN', token);
        } else {
            localStorage.removeItem('ACCESS_TOKEN');
        }
    };

    // Provide state and setter functions to the context
    return (
        <StateContext.Provider value={{
            user,
            token,
            singleTransaction,
            setUser,
            setToken,
            setSingleTransaction
        }}>
            {children}
        </StateContext.Provider>
    );
};

// Hook to use the context
export const useStateContext = () => useContext(StateContext);
