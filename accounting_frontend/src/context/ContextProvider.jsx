import { useState, createContext, useContext } from "react";

let StateContext = createContext({
    user: {},
    token: null,
    setUser: () => { },
    setToken: () => { }
});

export let ContextProvider = ({ children }) => {
    let [user, setUser] = useState({});
    let [token, _setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));

    let setToken = (token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem('ACCESS_TOKEN', token)
        } else {
            localStorage.removeItem('ACCESS_TOKEN')
        }
    }

    // const loginUser = (userData) => {
    //     setUser(userData);
    //     localStorage.setItem('USER', JSON.stringify(userData));
    // }

    // const logoutUser = () => {
    //     setUser({});
    //     localStorage.removeItem('USER');
    //     localStorage.removeItem('ACCESS_TOKEN');
    // }

    return (
        <StateContext.Provider value={{
            user, token, setToken, setUser
        }}>
            {children}
        </StateContext.Provider>
    );
}

export let useStateContext = () => useContext(StateContext);