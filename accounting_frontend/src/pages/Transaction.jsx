import { Table, TableBody, TableCell, TableHead, TableRow, Box, Toolbar, Container, CircularProgress, TablePagination, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import ViewIcon from '@mui/icons-material/Visibility';
import UpdateIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import '../css/transaction.css';
import { useEffect, useState } from 'react';
import Filters from '../components/Filters';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';
import { formatMoney } from '../utils/helper';
import EditTransactionModal from '../components/EditTransactionModal';
import { deleteTransaction } from '../utils/backend';

const Transaction = () => {
    // Add your logic to handle view, update, and delete actions
    let { setSingleTransaction, user } = useStateContext();

    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // State for managing confirmation dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    const handleView = (transaction) => {
        setSingleTransaction(transaction);
    };

    const handleUpdatePopup = (transaction) => {
        setSelectedTransaction(transaction);
    };

    const handleCloseModal = () => {
        setSelectedTransaction(null);
    };

    // Open the delete confirmation dialog
    const handleDeleteDialogOpen = (transaction) => {
        setTransactionToDelete(transaction);
        setOpenDeleteDialog(true);
    };

    // Close the delete confirmation dialog
    const handleDeleteDialogClose = () => {
        setTransactionToDelete(null);
        setOpenDeleteDialog(false);
    };

    // Handle the actual delete action after confirmation
    const handleDelete = async () => {
        if (transactionToDelete) {
            await deleteTransaction(setError, { id: transactionToDelete.id });
        }
        handleDeleteDialogClose();
        location.reload();
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to the first page when rows per page is changed
    };

    // Slice the transactions for the current page
    const currentPageTransactions = transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
                <Filters setTransactions={setTransactions} setError={setError} setLoading={setLoading} />
                <Table className="transaction-table" aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell><span className='transaction-header'>DATE</span></TableCell>
                            {user.userType !== 'client' && (
                                <TableCell><span className='transaction-header'>TYPE</span></TableCell>
                            )}
                            <TableCell><span className='transaction-header'>PROJECT</span></TableCell>
                            <TableCell><span className='transaction-header'>DESCRIPTION</span></TableCell>
                            {user.userType !== 'client' && (
                                <TableCell><span className='transaction-header'>PRODUCT LINE</span></TableCell>
                            )}
                            {user.userType !== 'client' && (
                                <TableCell><span className='transaction-header'>CLIENT</span></TableCell>
                            )}
                            {user.userType !== 'client' && (
                                <TableCell><span className='transaction-header'>CATEGORY</span></TableCell>
                            )}
                            <TableCell><span className='transaction-header'>AMOUNT</span></TableCell>
                            {user.userType !== 'client' && (
                                <TableCell><span className='transaction-header'>ACTIONS</span></TableCell>
                            )}
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
                                currentPageTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell><span className='transaction-content'>{dayjs(transaction.transactionDate).format('MM-DD-YYYY')}</span></TableCell>
                                        {user.userType !== 'client' && (
                                            <TableCell><span className='transaction-content'>{transaction.transactionType}</span></TableCell>
                                        )}
                                        <TableCell><span className='transaction-content'>{transaction.projectName}</span></TableCell>
                                        <TableCell><span className='transaction-content'>{transaction.description}</span></TableCell>
                                        {user.userType !== 'client' && (
                                            <TableCell><span className='transaction-content'>{transaction.productLine}</span></TableCell>
                                        )}
                                        {user.userType !== 'client' && (
                                            <TableCell><span className='transaction-content'>{transaction.company}</span></TableCell>
                                        )}
                                        {user.userType !== 'client' && (
                                            <TableCell><span className='transaction-content'>{transaction.category}</span></TableCell>
                                        )}
                                        <TableCell><span className='transaction-content'>{formatMoney(transaction.amount)}</span></TableCell>
                                        {user.userType !== 'client' && (
                                            <TableCell>
                                                <div className='actions-container'>
                                                    <span onClick={() => handleView(transaction)}>
                                                        <Link className='actions view' to="/view-transaction"><ViewIcon /></Link>
                                                    </span>
                                                    {/* <span className='actions update' onClick={() => handleUpdatePopup(transaction)}><UpdateIcon /></span> */}
                                                    <span className='actions delete' onClick={() => handleDeleteDialogOpen(transaction)}><DeleteIcon /></span>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={transactions.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Container>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleDeleteDialogClose}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to delete this transaction?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteDialogClose} color="primary">Cancel</Button>
                    <Button onClick={handleDelete} color="secondary">Delete</Button>
                </DialogActions>
            </Dialog>

            {selectedTransaction && (
                <EditTransactionModal
                    transaction={selectedTransaction}
                    onClose={handleCloseModal}
                />
            )}
        </Box>
    );
}

export default Transaction;
