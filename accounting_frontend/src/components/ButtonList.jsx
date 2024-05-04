import React from 'react';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TransactionIcon from '@mui/icons-material/AccountBalanceWallet';
import ReportsIcon from '@mui/icons-material/Description';
import AngleRightIcon from '@mui/icons-material/KeyboardArrowRight';

const ButtonList = () => {
    const location = useLocation();
    const sections = [
        { name: 'Dashboard', icon: <DashboardIcon />, route: '/dashboard' },
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
                const isItemSelected = location.pathname === section.route;
                return (
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
                );
            })}
        </List>
    );
}

export default ButtonList;
