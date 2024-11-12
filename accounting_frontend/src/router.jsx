import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddUser from './pages/AddUser';
import StarterLayout from './components/StarterLayout';
import MainLayout from './components/MainLayout';
import AccountInfo from './pages/AccountInfo';
import Transaction from './pages/Transaction';
import AddTransaction from './pages/AddTransaction';
import TrendAnalysisReports from './pages/TrendAnalysisReports';
import BalanceSheet from './pages/BalanceSheet';
import ClientManagement from './pages/ClientManagement';
import SingleTransaction from './pages/SingleTransaction';
import Register from './pages/Register';
import SingleUser from './pages/SingleUser';
import IncomeStatement from './pages/IncomeStatement';
import CashflowStatement from './pages/CashflowStatement';
import SegmentReport from './pages/SegmentReport';
import ForgotPassword from './pages/ForgotPassword';
import NoModuleAccess from './pages/NoModuleAccess';
import ManageAccess from './pages/ManageAccess';
import ManageProject from './pages/ManageProject';
import Payment from './pages/Payment';


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
            },
            {
                path: '/forgot-password',
                element: <ForgotPassword />
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
                path: '/no-module',
                element: <NoModuleAccess />
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
                path: '/manage-access',
                element: <ManageAccess />
            },
            {
                path: '/add-transaction',
                element: <AddTransaction />
            },
            {
                path: '/payment',
                element: <Payment />
            },
            {
                path: '/reports/trend-analysis',
                element: <TrendAnalysisReports />
            },
            {
                path: '/reports/balance-sheet',
                element: <BalanceSheet />
            },
            {
                path: '/reports/income-statement',
                element: <IncomeStatement />
            },
            {
                path: '/reports/cashflow-statement',
                element: <CashflowStatement />
            },
            {
                path: '/reports/segment-report',
                element: <SegmentReport />
            },
            {
                path: '/client-management',
                element: <ClientManagement />
            },
            {
                path: '/view-transaction',
                element: <SingleTransaction />
            },
            {
                path: '/view-client',
                element: <SingleUser />
            },
            {
              path: '/manage-project',
              element: <ManageProject />
          },

        ]
    }
]);

export default router;