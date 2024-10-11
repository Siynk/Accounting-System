import React, { useState } from 'react';
import { List, ListItemButton, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TransactionIcon from '@mui/icons-material/AccountBalanceWallet';
import ReportsIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import AngleRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AngleDownIcon from '@mui/icons-material/KeyboardArrowDown'; // Import the down icon
import { useStateContext } from '../context/ContextProvider';
import '../css/buttonList.css';

const ButtonList = () => {
    const location = useLocation();
    const { user } = useStateContext();
    const [openReports, setOpenReports] = useState(false);

    const sections = [
        { name: 'Dashboard', icon: <DashboardIcon />, route: '/dashboard' },
        ...(user.userType === 'admin' ? [{ name: 'Client Mgt.', icon: <PeopleIcon />, route: '/client-management' }] : []),
        { name: 'Transactions', icon: <TransactionIcon />, route: '/transactions' },
        { name: 'Reports', icon: <ReportsIcon />, route: '#', isDropdown: true },
    ];

    const reportSubsections = [
        { name: 'Balance Sheet', route: '/reports/balance-sheet' },
        { name: 'Income Statement', route: '/reports/income-statement' },
        { name: 'Cashflow Statement', route: '/reports/cashflow-statement' },
        { name: 'Trend Analysis Report', route: '/reports/trend-analysis' },
        { name: 'Segment Report', route: '/reports/segment-report' },
    ];

    const handleToggleReports = () => {
        setOpenReports(!openReports);
    };

    const isSelected = (route) => location.pathname === route;

    return (
        <List>
            {sections.map((section, index) => {
                const isItemSelected = isSelected(section.route);
                return (
                    <React.Fragment key={index}>
                        <ListItemButton
                            component={section.isDropdown ? 'div' : Link}
                            to={section.isDropdown ? undefined : section.route}
                            selected={isItemSelected}
                            onClick={section.isDropdown ? handleToggleReports : undefined}
                            sx={{ bgcolor: isItemSelected ? 'red' : 'inherit' }}
                            className="buttonListItem"
                        >
                            <ListItemIcon>
                                {section.icon}
                            </ListItemIcon>
                            <ListItemText primary={section.name} />
                            {section.isDropdown ? (openReports ? <AngleDownIcon /> : <AngleRightIcon />) : null}
                        </ListItemButton>
                        {section.isDropdown && (
                            <Collapse in={openReports} className="buttonListCollapse">
                                <List component="div" disablePadding>
                                    {reportSubsections.map((subsection, subIndex) => (
                                        <ListItemButton
                                            key={subIndex}
                                            component={Link}
                                            to={subsection.route}
                                            selected={isSelected(subsection.route)}
                                            className="buttonListSubItem"
                                        >
                                            <ListItemText primary={subsection.name} />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Collapse>
                        )}
                    </React.Fragment>
                );
            })}
        </List>
    );
}

export default ButtonList;
