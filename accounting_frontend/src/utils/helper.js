import CryptoJS from 'crypto-js';
import { useStateContext } from '../context/ContextProvider';
export default function getHeaderTitle(pathname){
    let pageTitle = '';
    let { singleTransaction, viewClient } = useStateContext();

    switch (pathname) {
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
        case '/client-management':
            pageTitle = 'CLIENT MANAGEMENT';
            break;
        case '/reports/balance-sheet':
            pageTitle = 'BALANCE SHEET';
            break;
        case '/reports/income-statement':
            pageTitle = 'INCOME STATEMENT';
            break;
        case '/reports/cashflow-statement':
            pageTitle = 'CASHFLOW STATEMENT';
            break;
        case '/reports/segment-report':
            pageTitle = 'SEGMENT REPORT';
            break;
        case '/reports/trend-analysis':
            pageTitle = 'TREND ANALYSIS REPORT';
            break;
        case '/no-module':
            pageTitle = 'NO MODULE ACCESS';
            break;
        case '/manage-access':
            pageTitle = 'ACCESS PRIVELEGE MANAGEMENT';
            break;
        case '/manage-project':
            pageTitle = 'MANAGE PROJECT';
            break;
        case '/payment':
          pageTitle = 'PAYMENT';
          break;
        case '/view-transaction':
            pageTitle = singleTransaction.company ? singleTransaction.company.toUpperCase() + ' TRANSACTION DETAILS' : 'Invalid Path Access';
            break;
        case '/view-client':
            pageTitle = viewClient.name.toUpperCase() + ' ACCOUNT DETAILS';
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

export function generateInvoiceNumber() {
  // Get the current date and time (year, month, day, hours, minutes, seconds)
  const date = new Date();
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);  // Add leading zero
  const day = ('0' + date.getDate()).slice(-2);  // Add leading zero
  const hours = ('0' + date.getHours()).slice(-2);  // Add leading zero
  const minutes = ('0' + date.getMinutes()).slice(-2);  // Add leading zero
  const seconds = ('0' + date.getSeconds()).slice(-2);  // Add leading zero

  // Generate a random 4-digit number
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  // Combine the date/time components and random number to create the invoice number
  const invoiceNumber = `INV${year}${month}${day}${hours}${minutes}${seconds}${randomNumber}`;

  return invoiceNumber;
}



