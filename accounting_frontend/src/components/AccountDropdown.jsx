import React, { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Link } from 'react-router-dom'; // Import Link from React Router
import '../css/accountDropdown.css';
import { useStateContext } from '../context/ContextProvider';

const AccountDropdown = () => {
    let [anchorEl, setAnchorEl] = useState(null);
    let { user } = useStateContext();

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    let handleMenuClose = () => {
        setAnchorEl(null);
    };

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
                <MenuItem component={Link} to="/account-info" className='menu' onClick={handleMenuClose}>Account Info</MenuItem>
                {user.userType === 'admin' && (
                    <MenuItem component={Link} to="/add-user" onClick={handleMenuClose}>Add New Admin</MenuItem>
                )}
            </Menu>
        </div>
    );
};

export default AccountDropdown;
