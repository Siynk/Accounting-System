import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';
import { getAccess } from "../utils/backend"; // Adjust your import based on how you structure this utility
import logo from '../assets/logo-removebg-preview.png';
import background from '../assets/5011342.jpg';
import '../css/login.css';

const moduleRoutes = {
    1: '/add-user',
    2: '/dashboard',
    3: '/client-management',
    4: '/transactions',
    5: '/reports/balance-sheet',
    6: '/reports/income-statement',
    7: '/reports/cashflow-statement',
    8: '/reports/trend-analysis',
    9: '/reports/segment-report',
};

function StarterLayout() {
    const { token, user } = useStateContext();
    const [error, setError] = useState(null);
    const [accesses, setAccesses] = useState([]);
    const [loading, setLoading] = useState(true);

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
        <div className="starter-layout" style={{ backgroundImage: `url(${background})` }}>
            <div className="starter-layout-content">
                <div className="logo-container">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="login-outlet">
                    <Outlet />
                </div>
            </div>
        </div>
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
