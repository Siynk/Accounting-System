import CryptoJS from 'crypto-js';
import { useStateContext } from '../context/ContextProvider';
export default function getHeaderTitle(useLocation){
    let location = useLocation();
    let pageTitle = '';
    let { singleTransaction } = useStateContext();

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
            pageTitle = 'ADD ADMIN USER';
            break;
        case '/account-info':
            pageTitle = 'ACCOUNT INFO';
            break;
        case '/single-transaction':
            pageTitle = singleTransaction.company.toUpperCase() + ' TRANSACTION DETAILS';
            break;
        default:
            pageTitle = 'DASHBOARD'; // default page title
    }
    return pageTitle;
}

export function testingForm(amount, link, encryptionKey) {
    const encryptedAmount = CryptoJS.AES.encrypt(amount, encryptionKey).toString();
    // Check if the input value is a number and not an empty string
    if (!isNaN(amount) && amount.trim() !== '') {
        // Define the base URL
        const baseUrl = link;
        
        const fullUrl = baseUrl + encodeURIComponent(encryptedAmount)+ "/"+encryptionKey;
        
        // Redirect to the new URL
        window.location.href = fullUrl;
    } else {
        // Alert the user if the input is not a number
        alert('Please enter a valid number.');
    }
}

export function formatMoney(amount) {
    // Convert the amount to a number if it's not already
    amount = Number(amount);

    // Check if the amount is a valid number
    if (isNaN(amount)) {
        return 'Invalid amount';
    }

    // Format the amount to standard money format with two decimal places
    return amount.toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP'
    });
}


