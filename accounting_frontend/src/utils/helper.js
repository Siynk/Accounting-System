export default function getHeaderTitle(useLocation){
    let location = useLocation();
    let pageTitle = '';

    switch (location.pathname) {
        case '/dashboard':
            pageTitle = 'DASHBOARD';
            break;
        case '/transactions':
            pageTitle = 'TRANSACTIONS';
            break;
        case '/add-transaction':
            pageTitle = 'ADD TRANSACTION';
            break;
        case '/add-user':
            pageTitle = 'ADD USER';
            break;
        case '/account-info':
            pageTitle = 'ACCOUNT INFO';
            break;
        default:
            pageTitle = 'DASHBOARD'; // default page title
    }
    return pageTitle;
}