import React, { useState, createContext, useContext } from "react";

// Define the context with an initial structure
const StateContext = createContext({
    user: {},
    token: null,
    singleTransaction: null,
    viewClient: null, // New state for viewClient
    setUser: () => { },
    setToken: () => { },
    setSingleTransaction: () => { },
    setViewClient: () => { } // Function to set viewClient
});

// Define the provider component
export const ContextProvider = ({ children }) => {
    const [user, setUser] = useState({});
    const [token, _setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));
    const [singleTransaction, setSingleTransaction] = useState(null);
    const [viewClient, setViewClient] = useState(null); // State for viewClient

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
            viewClient, // Include viewClient in the context value
            setUser,
            setToken,
            setSingleTransaction,
            setViewClient // Function to set viewClient
        }}>
            {children}
        </StateContext.Provider>
    );
};

// Hook to use the context
export const useStateContext = () => useContext(StateContext);