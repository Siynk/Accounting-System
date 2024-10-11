import { Table, TableBody, TableCell, TableHead, TableRow, Box, Toolbar, Container, CircularProgress } from '@mui/material';
import ViewIcon from '@mui/icons-material/Visibility';
import UpdateIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import '../css/transaction.css';
import { useState } from 'react';
import Filters from '../components/Filters';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';
import { formatMoney } from '../utils/helper';
import EditTransactionModal from '../components/EditTransactionModal';
import { deleteTransaction } from '../utils/backend';

const Transaction = () => {
    // Add your logic to handle view, update, and delete actions
    let { setSingleTransaction } = useStateContext();

    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleView = (transaction) => {
        setSingleTransaction(transaction);
    };

    const handleUpdatePopup = (transaction) => {
        setSelectedTransaction(transaction);
    };

    const handleCloseModal = () => {
        setSelectedTransaction(null);
    };

    const handleDelete = (id) => {
        deleteTransaction(setError, { id });
    };





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
            {<Container maxWidth="lg" className='tableContainer'>
                <Filters setTransactions={setTransactions} setError={setError} setLoading={setLoading} />
                <Table className="transaction-table" aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell><span className='transaction-header'>DATE</span></TableCell>
                            <TableCell><span className='transaction-header'>TYPE</span></TableCell>
                            <TableCell><span className='transaction-header'>DESCRIPTION</span></TableCell>
                            <TableCell><span className='transaction-header'>PRODUCT LINE</span></TableCell>
                            <TableCell><span className='transaction-header'>CLIENT</span></TableCell>
                            <TableCell><span className='transaction-header'>CASH FLOW CATEGORY</span></TableCell>
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
                                        <TableCell><span className='transaction-content'>{transaction.productLine}</span></TableCell>
                                        <TableCell><span className='transaction-content'>{transaction.company}</span></TableCell>
                                        <TableCell><span className='transaction-content'>{transaction.cashFlowCategory}</span></TableCell>
                                        <TableCell><span className='transaction-content'>{formatMoney(transaction.amount)}</span></TableCell>
                                        <TableCell>
                                            <div className='actions-container'>
                                                <span onClick={() => handleView(transaction)}><Link className='actions view' to="/view-transaction"><ViewIcon /></Link></span>
                                                <span className='actions update' onClick={() => handleUpdatePopup(transaction)}><UpdateIcon /></span>
                                                <span className='actions delete' onClick={() => handleDelete(transaction.id)}><DeleteIcon /></span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )
                        )}
                    </TableBody>
                </Table>
            </Container>}
            {selectedTransaction && (
                <EditTransactionModal
                    transaction={selectedTransaction}
                    onClose={handleCloseModal}
                />
            )}
        </Box >
    );
}

export default Transaction;
