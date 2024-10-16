import React, { useState, createContext, useContext } from "react";

// Define the context with an initial structure
const StateContext = createContext({
    user: {},
    token: null,
    singleTransaction: false,
    viewClient: null,
    setUser: () => { },
    setToken: () => { },
    setSingleTransaction: () => { },
    setViewClient: () => { }
});

// Define the provider component
export const ContextProvider = ({ children }) => {
    const [token, _setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));
    const [singleTransaction, setSingleTransaction] = useState(false);
    const [viewClient, setViewClient] = useState(null);

    // Retrieve user data from localStorage or set as empty object initially
    const [user, _setUser] = useState(() => {
        const storedUser = localStorage.getItem('USER_DATA');
        return storedUser ? JSON.parse(storedUser) : {};
    });

    // Function to set the user and manage local storage
    const setUser = (user) => {
        _setUser(user);
        if (user) {
            localStorage.setItem('USER_DATA', JSON.stringify(user));
        } else {
            localStorage.removeItem('USER_DATA');
        }
    };

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
            viewClient,
            setUser,
            setToken,
            setSingleTransaction,
            setViewClient
        }}>
            {children}
        </StateContext.Provider>
    );
};

// Hook to use the context
export const useStateContext = () => useContext(StateContext);
