import React from 'react';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TransactionIcon from '@mui/icons-material/AccountBalanceWallet';
import ReportsIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import AngleRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useStateContext } from '../context/ContextProvider';

const ButtonList = () => {
    const location = useLocation();
    let { user } = useStateContext();
    const sections = [
        { name: 'Dashboard', icon: <DashboardIcon />, route: '/dashboard' },
        // Only include the Client Mgt. section if userType is admin
        ...(user.userType === 'admin' ? [{ name: 'Client Mgt.', icon: <PeopleIcon />, route: '/client-management' }] : []),
        { name: 'Transactions', icon: <TransactionIcon />, route: '/transactions' },
        { name: 'Reports', icon: <ReportsIcon />, route: '/reports' },
    ];

    // Function to determine the background color based on the selected state
    const getBackgroundColor = (isItemSelected) => ({
        bgcolor: isItemSelected ? 'lightgray' : 'inherit',
        '&.Mui-selected': {
            bgcolor: 'lightgray',
            '&:hover': {
                bgcolor: 'lightgray',
            },
        },
    });

    return (
        <List>
            {sections.map((section, index) => {
                // Check if the condition property exists and is true, or if it's undefined (which means no condition)
                const shouldRender = section.condition === undefined || section.condition;
                const isItemSelected = location.pathname === section.route;
                return shouldRender ? (
                    <ListItemButton
                        key={index}
                        component={Link}
                        to={section.route}
                        selected={isItemSelected}
                        sx={getBackgroundColor(isItemSelected)}
                    >
                        <ListItemIcon>
                            {section.icon}
                        </ListItemIcon>
                        <ListItemText primary={section.name} />
                        <AngleRightIcon />
                    </ListItemButton>
                ) : null;
            })}
        </List>
    );
}

export default ButtonList;

