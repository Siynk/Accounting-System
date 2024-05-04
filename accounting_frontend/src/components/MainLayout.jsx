import { Navigate, Outlet, useLocation } from 'react-router-dom';
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
import { getLoggedInUser } from '../utils/backend';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { logout } from '../utils/backend';
import '../css/mainlayout.css';
import ButtonList from './ButtonList';
import getHeaderTitle from '../utils/helper';


const defaultTheme = createTheme();
function MainLayout() {
    let { user, token, setUser, setToken } = useStateContext();

    if (!token) {
        return <Navigate to={'/'} />
    }

    let handleLogout = () => {
        logout(setUser, setToken);
    }

    React.useEffect(() => {
        getLoggedInUser(setUser);
    }, []);

    let [open, setOpen] = React.useState(true);
    let toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box className="box">
                <CssBaseline />
                <AppBar position="absolute" open={open}>
                    <Toolbar
                        className='toolbar'
                    >
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
                            {getHeaderTitle(useLocation)}
                        </Typography>

                        <Typography onClick={handleLogout} className='typographyLogout'><ExitToAppIcon />Logout </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open}>
                    <Toolbar
                        className='drawer'
                    >
                        <Typography>{user.name}</Typography>
                        <AccountDropdown />
                        <IconButton onClick={toggleDrawer} >
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

export default MainLayout
