import { useEffect, useState } from 'react';
import { Outlet, Navigate,useNavigate } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';
import { getAccess } from "../utils/backend"; // Adjust your import based on how you structure this utility
import logo from '../assets/logo-removebg-preview.png';
import background from '../assets/5011342.jpg';
import '../css/login.css';
import { Box, Button, Typography } from '@mui/material';

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

function StarterLayout() {
    const { token, user } = useStateContext();
    const [error, setError] = useState(null);
    const [accesses, setAccesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); 

    useEffect(() => {
        if (token && user) {
            const fetchAccess = async () => {
                try {
                    await getAccess({ user_id: user.id }, setError, setAccesses);
                    setLoading(false);
                } catch (error) {
                    setError('Failed to fetch access rights.');
                    setLoading(true)
                }
            };
            fetchAccess();
        } else {
            setLoading(true); // If no token, just set loading to false
        }
    }, [token, user]);



    if (token) {
        if (loading) {
            return <LoadingDialog />; // Use the loading dialog component
        }

        if (user.userType === 'client' || user.userType === 'superadmin') {
            return <Navigate to={'/dashboard'} />;
        }

        const dashboardAccess = accesses.find(access => access.module_id === 2);

        // Check if user has access to the dashboard
        if (dashboardAccess && dashboardAccess.hasAccess) {
            return <Navigate to={moduleRoutes[dashboardAccess.module_id]} />;
        }

        // Check for first accessible module if no dashboard access
        const firstAccessibleModule = accesses.find(access => access.hasAccess);
        if (firstAccessibleModule) {
            return <Navigate to={moduleRoutes[firstAccessibleModule.module_id]} />;
        }

        // If no access to any modules
        return <Navigate to="/no-module" />;
    }


    // Render the login page when not logged in
    return (
        <Box maxWidth='100%' className="starter-layout" style={{ backgroundImage: `url(${background})` }}>
            <Box maxWidth='xs' className="starter-layout-content">
            <Box className="logo-container" style={{
                background: 'linear-gradient(to bottom left, rgba(8, 65, 18, 1), rgba(0, 102, 51, 1), rgba(34, 139, 34, 1))',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                width: '100%',
                maxWidth: '400px',  // Limit the width for design balance
                margin: 'auto',
                color: '#ffffff',
            }}>
                  {/* Logo */}
                  <img src={logo} alt="Joriel's Enterprise Logo" style={{
                      width: '120px',  // Adjust the logo size
                      height: 'auto',
                      marginBottom: '20px',
                  }} />

                  {/* Main Heading */}
                  <Typography variant="h4" style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 700,
                      fontSize: '28px',
                      color: '#ffffff',
                  }}>
                      Welcome to Joriel's Enterprise
                  </Typography>
                  
                  {/* Tagline */}
                  <Typography variant="body1" style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontWeight: 400,
                      fontSize: '16px',
                      color: '#d0d0d0',
                      marginTop: '10px',
                  }}>
                      Empowering Businesses, One Step at a Time
                  </Typography>

                  {/* Sign-Up Button */}
                  <Button 
                    variant="contained" 
                    color="primary" 
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        textTransform: 'none',
                        fontWeight: 600,
                    }}
                    onClick={() => navigate('/register')}  // Navigate to /register when clicked
                  >
                      Sign Up
                  </Button>

                  {/* Optional Decorative Line */}
                  <Box style={{
                      marginTop: '20px',
                      width: '60%',
                      height: '2px',
                      backgroundColor: '#fff',
                      opacity: 0.2
                  }} />

                  {/* Additional Decorative Element: Geometric Circle or Pattern */}
                  <Box style={{
                      marginTop: '20px',
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#ffffff',
                      borderRadius: '50%',
                      opacity: 0.3,   // Slight transparency for subtle effect
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                  }} className="decorative-element" />

              </Box>
              <Box className="login-outlet">
                  <Outlet />
              </Box>
            </Box>
        </Box>
    );
}

function LoadingDialog() {
    return (
        <div className="loading-dialog">
            <div className="loading-content">
                <h2>Loading...</h2>
                <div className="spinner"></div>
            </div>
        </div>
    );
}

export default StarterLayout;
