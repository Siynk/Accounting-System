import { Table, TableBody, TableCell, TableHead, TableRow, Box, Toolbar, Container, CircularProgress } from '@mui/material';
import ViewIcon from '@mui/icons-material/Visibility';
import UpdateIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import '../css/transaction.css';
import { useCallback, useEffect, useState } from 'react';
import Filters from '../components/Filters';
import { getAllTransactions } from '../utils/backend';
import dayjs from 'dayjs';

const Transaction = () => {
    // Add your logic to handle view, update, and delete actions
    const handleView = (id) => { /* ... */ };
    const handleUpdate = (id) => { /* ... */ };
    const handleDelete = (id) => { /* ... */ };

    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Debounce function to prevent too many requests
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // Fetch transactions with debounce to avoid too many requests
    const fetchTransactions = useCallback(debounce(() => {
        getAllTransactions(setError, setTransactions)
            .finally(() => setLoading(false));
    }, 500), [getAllTransactions]); // Adjust the debounce time as needed

    useEffect(() => {
        fetchTransactions();
    }, []);

    return (
        <Box
            component="main"
            sx={{
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[100]
                        : theme.palette.grey[900],
                flexGrow: 1,
                height: '100vh',
                overflow: 'auto',
            }}
        >
            <Toolbar />
            <Container maxWidth="lg" className='tableContainer'>
                <Filters />
                <Table className="transaction-table" aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell><span className='transaction-header'>DATE</span></TableCell>
                            <TableCell><span className='transaction-header'>TYPE</span></TableCell>
                            <TableCell><span className='transaction-header'>DESCRIPTION</span></TableCell>
                            <TableCell><span className='transaction-header'>PAYMENT METHOD</span></TableCell>
                            <TableCell><span className='transaction-header'>CLIENT</span></TableCell>
                            <TableCell><span className='transaction-header'>CATEGORY</span></TableCell>
                            <TableCell><span className='transaction-header'>ACCOUNTS</span></TableCell>
                            <TableCell><span className='transaction-header'>DUE DATE</span></TableCell>
                            <TableCell><span className='transaction-header'>ACTIVITY</span></TableCell>
                            <TableCell><span className='transaction-header'>AMOUNT</span></TableCell>
                            <TableCell><span className='transaction-header'>ACTIONS</span></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center"><CircularProgress /></TableCell>
                            </TableRow>
                        ) : (
                            transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center">No Records Found</TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell><span className='transaction-content'>{dayjs(transaction.transactionDate).format('MM-DD-YYYY')}</span></TableCell>
                                        <TableCell><span className='transaction-content'>{transaction.transactionType}</span></TableCell>
                                        <TableCell><span className='transaction-content'>{transaction.description}</span></TableCell>
                                        <TableCell><span className='transaction-content'>{transaction.paymentMethod}</span></TableCell>
                                        <TableCell><span className='transaction-content'>{transaction.counterParty}</span></TableCell>
                                        <TableCell><span className='transaction-content'>{transaction.category}</span></TableCell>
                                        <TableCell><span className='transaction-content'>{transaction.accounts ? transaction.accounts : 'N/A'}</span></TableCell>
                                        <TableCell><span className='transaction-content'>{transaction.effectivityDate ? dayjs(transaction.effectivityDate).format('MM-DD-YYYY') : 'N/A'}</span></TableCell>
                                        <TableCell><span className='transaction-content'>{transaction.activity}</span></TableCell>
                                        <TableCell><span className='transaction-content'>{transaction.amount}</span></TableCell>
                                        <TableCell>
                                            <div className='actions-container'>
                                                <span title="View Transaction" className='actions view' onClick={() => handleView(transaction.id)}><ViewIcon /></span>
                                                <span title="Edit Transaction" className='actions update' onClick={() => handleUpdate(transaction.id)}><UpdateIcon /></span>
                                                <span title="Delete Transaction" className='actions delete' onClick={() => handleDelete(transaction.id)}><DeleteIcon /></span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )
                        )}
                    </TableBody>
                </Table>
            </Container>
        </Box >
    );
}

export default Transaction;
