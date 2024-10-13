import React, { useEffect, useState } from 'react';
import { List, ListItemButton, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TransactionIcon from '@mui/icons-material/AccountBalanceWallet';
import ReportsIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import AngleRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AngleDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useStateContext } from '../context/ContextProvider';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { getAccess } from "../utils/backend";
import '../css/buttonList.css';

const ButtonList = () => {
    const location = useLocation();
    const { user } = useStateContext();
    const [openReports, setOpenReports] = useState(false);
    const [accesses, setAccesses] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && user.id) {
            const payload = { user_id: user.id }; // Adjust payload based on your requirements

            const fetchAccess = async () => {
                await getAccess(payload, setError, setAccesses);
            };

            fetchAccess();
        }

    }, [user.id]);

    // Define the modules as given
    const modules = [
        { id: 1, description: "Add New Admin" },
        { id: 2, description: "Dashboard" },
        { id: 3, description: "Client Management" },
        { id: 4, description: "Transactions" },
        { id: 5, description: "Reports" },
        { id: 6, description: "Balance Sheet" },
        { id: 7, description: "Income Statement" },
        { id: 8, description: "Cashflow Statement" },
        { id: 9, description: "Trend Analysis" },
        { id: 10, description: "Segment Report" },
    ];

    // Define sections and map them to modules
    const sections = [
        { name: 'Dashboard', icon: <DashboardIcon />, route: '/dashboard', moduleId: 2 },
        { name: 'Client Mgt.', icon: <PeopleIcon />, route: '/client-management', moduleId: 3 },
        { name: 'Transactions', icon: <TransactionIcon />, route: '/transactions', moduleId: 4 },
        ...(user.userType === 'superadmin' ? [{ name: 'Manage Access', icon: <AdminPanelSettingsIcon />, route: '/manage-access' }] : []),
        { name: 'Reports', icon: <ReportsIcon />, route: '#', isDropdown: true, moduleId: 5 },
    ];

    const reportSubsections = [
        { name: 'Balance Sheet', route: '/reports/balance-sheet', moduleId: 6 },
        { name: 'Income Statement', route: '/reports/income-statement', moduleId: 7 },
        { name: 'Cashflow Statement', route: '/reports/cashflow-statement', moduleId: 8 },
        { name: 'Trend Analysis', route: '/reports/trend-analysis', moduleId: 9 },
        { name: 'Segment Report', route: '/reports/segment-report', moduleId: 10 },
    ];

    // Filter sections based on user access
    // Filter sections based on user access
    const accessibleSections = sections.filter(section => {
        if (user.userType === 'superadmin') {
            return true; // Allow superadmins access to all sections
        }
        if (user.userType === 'client') {
            return section.moduleId !== 3; // Exclude Client Management
        }
        if (section.moduleId) {
            const access = accesses.find(access => access.module_id === section.moduleId);
            return access ? access.hasAccess : false;
        }
        return true; // Always show sections without moduleId
    });

    // Filter report subsections based on access
    const accessibleReportSubsections = reportSubsections.filter(subsection => {
        if (user.userType === 'superadmin') {
            return true; // Allow superadmins access to all subsections
        }
        if (user.userType === 'client') {
            return true; // Allow clients access to all report subsections
        }
        const access = accesses.find(access => access.module_id === subsection.moduleId);
        return access ? access.hasAccess : false;
    });


    const handleToggleReports = () => {
        setOpenReports(!openReports);
    };

    const isSelected = (route) => location.pathname === route;

    return (
        <List>
            {accessibleSections.map((section, index) => {
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
                                    {accessibleReportSubsections.map((subsection, subIndex) => (
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
