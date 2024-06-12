import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddUser from './pages/AddUser';
import StarterLayout from './components/StarterLayout';
import MainLayout from './components/MainLayout';
import AccountInfo from './pages/AccountInfo';
import Transaction from './pages/Transaction';
import AddTransaction from './pages/AddTransaction';
import Reports from './pages/Reports';
import ClientManagement from './pages/ClientManagement';
import SingleTransaction from './pages/SingleTransaction';
import Register from './pages/Register';


const router = createBrowserRouter([
    {
        path: '/',
        element: <StarterLayout />,
        children: [
            {
                path: '/',
                element: <Login />
            },
            {
                path: '/register',
                element: <Register />
            }

        ]
    },
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                path: '/dashboard',
                element: <Dashboard />
            },
            {
                path: '/account-info',
                element: <AccountInfo />
            },
            {
                path: '/add-user',
                element: <AddUser />
            },
            {
                path: '/transactions',
                element: <Transaction />
            },
            {
                path: '/add-transaction',
                element: <AddTransaction />
            },
            {
                path: '/reports',
                element: <Reports />
            },
            {
                path: '/client-management',
                element: <ClientManagement />
            },
            {
                path: '/single-transaction',
                element: <SingleTransaction />
            },

        ]
    }
]);

export default router;