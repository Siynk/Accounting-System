import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppBar from '../components/AppBar';
import Drawer from '../components/Drawer';
import Footer from '../components/Footer';
import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useStateContext } from '../context/ContextProvider';
import AccountDropdown from './AccountDropdown';
import { getLoggedInUser, getAccess, logout } from '../utils/backend';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import '../css/mainlayout.css';
import ButtonList from './ButtonList';
import getHeaderTitle from '../utils/helper';

const defaultTheme = createTheme();

function MainLayout() {
    const { user, token, setUser, setToken } = useStateContext();
    const [error, setError] = React.useState(null);
    const [accesses, setAccesses] = React.useState(false);
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    const [hasTransactionAccess, setHasTransactionAccess] = React.useState(false);

    const moduleRoutes = {
        1: '/add-user',
        2: '/dashboard',
        3: '/client-management',
        4: '/transactions',
        6: '/reports/balance-sheet',
        7: '/reports/income-statement',
        8: '/reports/cashflow-statement',
        9: '/reports/trend-analysis',
        10: '/reports/segment-report',
        11: '/manage-project',
    };

    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    // Redirect if token is not available
    if (!token) {
      return <Navigate to={'/'} />;
    }

    React.useEffect(() => {
        if (isLoggingOut) {
            navigate('/'); 
        }
    }, [isLoggingOut]);

    React.useEffect(() => {
      if ((token && user ) && user.userType === 'admin') {
        const fetchAccess = async () => {
            try {
                await getAccess({ user_id: user.id }, setError, setAccesses);
            } catch (error) {
                setError('Failed to fetch access rights.');
            }
        };
        fetchAccess();
    } 
    }, [token, user]);

    React.useEffect(() => {
        if (accesses.length > 0 && accesses) {
            const excludedPaths = ['/account-info', ];
            const hasTransactionAccess = accesses.find(access => access.module_description === 'Transactions');
            if (hasTransactionAccess && hasTransactionAccess.hasAccess) {
                excludedPaths.push('/add-transaction', '/view-transaction');
            }

            if (!excludedPaths.includes(currentPath)) {
                if (user.userType === 'admin') {
                    const hasCurrentPathAccess = accesses.find(access => moduleRoutes[access.module_id] === currentPath);
                    if (!hasCurrentPathAccess || !hasCurrentPathAccess.hasAccess) {
                      navigate('/no-module');
                    } else {
                      navigate(currentPath);
                    }
                }
            }
        }
        
        if(accesses.length === 0 && user.userType === 'admin'){
          navigate('/no-module');
        }
    }, [currentPath, accesses]);

    
    React.useEffect(() => {
        if (user.userType === 'client') {
          const excludedPaths = [
            '/add-user',
            '/manage-access',
            '/client-management',
            '/reports/balance-sheet',
            '/reports/income-statement',
            '/reports/cashflow-statement',
            '/reports/trend-analysis',
            '/reports/segment-report'
        ];
        
            
            if (excludedPaths.includes(currentPath)) {
              navigate('/no-module');
            }
        }
    }, [currentPath]);
  
  const handleLogout = () => {
      logout(setUser, setToken);
      setIsLoggingOut(true);
  };
    React.useEffect(() => {
        getLoggedInUser(setUser);
    }, []);

    const [open, setOpen] = React.useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box className="box">
                <CssBaseline />
                <AppBar position="absolute" open={open}>
                    <Toolbar className='toolbar'>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            className='typographyHeader'
                        >
                            {getHeaderTitle(currentPath)}
                        </Typography>
                        <Typography onClick={handleLogout} className='typographyLogout'>
                            <ExitToAppIcon />Logout
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open}>
                    <Toolbar className='drawer'>
                        <Typography>{user.name}</Typography>
                        <AccountDropdown />
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon className='leftIcon' />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <ButtonList />
                </Drawer>
                <Outlet />
                <Footer />
            </Box>
        </ThemeProvider>
    );
}

export default MainLayout;
