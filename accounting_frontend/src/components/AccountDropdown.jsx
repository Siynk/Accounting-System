import React, { useState, useEffect } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Link } from 'react-router-dom';
import '../css/accountDropdown.css';
import { useStateContext } from '../context/ContextProvider';
import { getAccess } from '../utils/backend'; // Make sure you import your access function

const AccountDropdown = () => {
    let [anchorEl, setAnchorEl] = useState(null);
    let { user } = useStateContext();
    const [hasAddUserAccess, setHasAddUserAccess] = useState(false);
    const [accesses, setAccesses] = useState([]);
    const [error, setError] = useState(null);
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        if (user && user.id) {
            const payload = { user_id: user.id }; // Adjust payload based on your requirements

            const fetchAccess = async () => {
                await getAccess(payload, setError, setAccesses);
            };

            fetchAccess();
        }

    }, [user.id]);

    useEffect(() => {
        const fetchAccess = async () => {
            if (accesses.length) {
                const addUserAccess = accesses.find(access => access.module_id === 1);
                setHasAddUserAccess(addUserAccess ? addUserAccess.hasAccess : false);
            }
        };

        if (user) {
            if (user.userType === 'superadmin') {
                setHasAddUserAccess(true);
            } else {
                fetchAccess();
            }
        }
    }, [user, accesses]);

    return (
        <div>
            <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
            >
                <ArrowDropDownIcon />
            </IconButton>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem component={Link} to="/account-info" className='menu' onClick={handleMenuClose}>
                    Account Info
                </MenuItem>
                {hasAddUserAccess ? (
                    <MenuItem component={Link} to="/add-user" onClick={handleMenuClose}>
                        Add New Admin
                    </MenuItem>
                ) : null}
            </Menu>
        </div>
    );
};

export default AccountDropdown;
