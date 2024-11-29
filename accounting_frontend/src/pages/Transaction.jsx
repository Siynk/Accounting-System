import { Table, TableBody, TableCell, TableHead, TableRow, Box, Toolbar, Container, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Button, TablePagination, Checkbox, Typography } from '@mui/material';
import ViewIcon from '@mui/icons-material/Visibility';
import UpdateIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import '../css/transaction.css';
import { useEffect, useState } from 'react';
import Filters from '../components/Filters';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';
import { formatMoney } from '../utils/helper';
import EditTransactionModal from '../components/EditTransactionModal';
import { deleteTransaction, createPayment, addTransaction } from '../utils/backend';

const Transaction = () => {
    const { setSingleTransaction, user } = useStateContext();
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fee, setFee] = useState('');
    const navigate = useNavigate();

    // Pagination states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(user.userType === 'client' ? 10 : 5);

    // State for managing confirmation dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    // State for managing checkboxes visibility
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [selectedTransactions, setSelectedTransactions] = useState(new Set());

    // Toggle checkboxes
    const handleToggleCheckboxes = () => {
        setShowCheckboxes(prev => !prev);
        setSelectedTransactions(new Set()); // Clear selected transactions when toggling
    };

    const handleFeeChange = (e) => {
      setFee(e.target.value);
    };

    const handleView = (transaction, path) => {
        setSingleTransaction(transaction);
        navigate(path);
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
            try {
                await deleteTransaction(setError, { id: transactionToDelete.id });
                setTransactions(prevTransactions => 
                    prevTransactions.filter(transaction => transaction.id !== transactionToDelete.id)
                );
            } catch (error) {
                setError("Failed to delete transaction.");
            }
        }
        handleDeleteDialogClose();
        location.reload();
    };

    // Handle page change in pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Handle rows per page change in pagination
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to the first page when rows per page changes
    };

    // Handle Pay button click and create payment
    const handlePayButtonClick = async (transaction) => {
        try {
            await createPayment({ transactionID: transaction.id, clientID: transaction.clientID, projectID: transaction.projectID, amount: parseFloat(transaction.amount), status: 'Pending' }, setError, (message) => alert(message));
            window.location.reload();
        } catch (error) {
            setError("Failed to create payment.");
        }
    };

    // Toggle individual row checkbox
    const handleCheckboxChange = (transactionId) => {
        const newSelectedTransactions = new Set(selectedTransactions);
        if (newSelectedTransactions.has(transactionId)) {
            newSelectedTransactions.delete(transactionId);
        } else {
            newSelectedTransactions.add(transactionId);
        }
        setSelectedTransactions(newSelectedTransactions);
    };

    // Handle SEND TO CLIENT button action
    const handleSendToClient = () => {
        // Logic to send selected transactions to the client
        const firstTransaction = [...selectedTransactions][0];
        let totalAmount = 0;

        selectedTransactions.forEach(transaction => {
            totalAmount += parseFloat(transaction.amount); // Convert the amount to a number and add to totalAmount
        });
        const calculatedFee = (totalAmount * fee) / 100;
        const payload = {
          cashFlow: 'Inflow',
          category: 'Operating',
          clientID: firstTransaction.clientID,
          company: firstTransaction.company,
          description: 'Invoice',
          productLine: firstTransaction.productLine,
          projectID:firstTransaction.projectID,
          projectName:firstTransaction.projectName,
          status: 'Approved',
          transactionStatus: 'To Settle',
          transactionTypes:["11"],
          amount: totalAmount + calculatedFee
        }

        addTransaction(payload, setError);

        alert("Selected transactions have been sent to the client.");
        location.reload();
    };

    return (
        <Box
            component="main"
            sx={{
                backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
                flexGrow: 1,
                height: '100vh',
                overflow: 'auto',
            }}
        >
            <Toolbar />
            <Container maxWidth="xl" className='tableContainer'>
                <Filters setTransactions={setTransactions} setError={setError} setLoading={setLoading} />
                
                {user.userType !== 'client' && (
                    <>
                        <Button
                            variant="contained"
                            color={showCheckboxes ? "secondary" : "primary"}
                            onClick={handleToggleCheckboxes}
                            sx={{ marginBottom: 2 }}
                        >
                            {showCheckboxes ? 'Hide Checkboxes' : 'Select Unsettled Transactions'}
                        </Button>

                        {showCheckboxes && selectedTransactions.size > 0 && (
                            <>
                                {/* Fee Input */}
                                <input
                                    label="Fee"
                                    type="number"
                                    placeholder='Enter Fee Percentage (%)'
                                    value={fee}
                                    onChange={handleFeeChange}
                                    variant="outlined"
                                    style={{marginLeft: 10, height:35, position:'relative',top:-5 }}
                                />

                                {/* Send to Client Button */}
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleSendToClient}
                                    sx={{ marginBottom: 2, marginLeft: 1.5 }}
                                >
                                    PROCESS
                                </Button>
                            </>
                        )}
                    </>
                )}

                {!showCheckboxes && user.userType !== 'client' && (
                    <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 2 }}>
                        <strong>NOTE:</strong> Make sure to select transactions with the same <strong>Project</strong> and <strong>Client</strong>.
                    </Typography>
                )}

                <Table className="transaction-table" aria-label="simple table" sx={{ tableLayout: 'fixed' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell><span className='transaction-header'>DATE</span></TableCell>
                            {user.userType !== 'client' && <TableCell><span className='transaction-header'>TYPE</span></TableCell>}
                            <TableCell><span className='transaction-header'>PROJECT</span></TableCell>
                            <TableCell><span className='transaction-header'>DESCRIPTION</span></TableCell>
                            {user.userType !== 'client' && <TableCell><span className='transaction-header'>SEGMENT</span></TableCell>}
                            {user.userType !== 'client' && <TableCell><span className='transaction-header'>CLIENT</span></TableCell>}
                            {user.userType !== 'client' && <TableCell><span className='transaction-header'>CATEGORY</span></TableCell>}
                            <TableCell><span className='transaction-header'>AMOUNT</span></TableCell>
                            {user.userType !== 'client' && <TableCell><span className='transaction-header'>STATUS</span></TableCell>}
                            <TableCell><span className='transaction-header'>ACTIONS</span></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={user.userType === 'client' ? 4 : 10} align="center"><CircularProgress /></TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={user.userType === 'client' ? 4 : 10} align="center">No Records Found</TableCell>
                            </TableRow>
                        ) : (
                            transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction, index) => {
                                const isUnsettled = transaction.status === 'Unsettled';
                                return (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {showCheckboxes && isUnsettled && (
                                                <Checkbox
                                                    checked={selectedTransactions.has(transaction)}
                                                    onChange={() => handleCheckboxChange(transaction)}
                                                />
                                            )}
                                            <span className='transaction-content'>{dayjs(transaction.transactionDate).format('MM-DD-YYYY')}</span>
                                        </TableCell>
                                        {user.userType !== 'client' && <TableCell><span className='transaction-content'>{transaction.transactionType}</span></TableCell>}
                                        <TableCell><span className='transaction-content'>{transaction.projectName || 'N/A'}</span></TableCell>
                                        <TableCell><span className='transaction-content'>{transaction.description}</span></TableCell>
                                        {user.userType !== 'client' && <TableCell><span className='transaction-content'>{transaction.productLine}</span></TableCell>}
                                        {user.userType !== 'client' && <TableCell><span className='transaction-content'>{transaction.company || 'N/A'}</span></TableCell>}
                                        {user.userType !== 'client' && <TableCell><span className='transaction-content'>{transaction.category}</span></TableCell>}
                                        <TableCell><span className='transaction-content'>{formatMoney(parseFloat(transaction.amount))}</span></TableCell>
                                        {user.userType !== 'client' && <TableCell><span className='transaction-content'>{transaction.status || 'N/A'}</span></TableCell>}
                                        {user.userType !== 'client' && (
                                          <TableCell>
                                            <div className='actions-container'>
                                              <span onClick={() => handleView(transaction)}>
                                                <Link className='actions view' to="/view-transaction"><ViewIcon /></Link>
                                              </span>
                                              {/* Uncomment and Implement Update feature if needed */}
                                              {/* <span className='actions update' onClick={() => handleUpdatePopup(transaction)}><UpdateIcon /></span> */}
                                              <span className='actions delete' onClick={() => handleDeleteDialogOpen(transaction)}><DeleteIcon /></span>
                                            </div>
                                          </TableCell>
                                        )}
                                        {user.userType === 'client' && (
                                          <TableCell>
                                            {/* View Invoice Button */}
                                            <Button
                                              className="btn-view-invoice"
                                              sx={{
                                                background: 'linear-gradient(45deg, #2e7d32, #66bb6a)', // Green tones (lighter green)
                                                color: 'white',
                                                fontWeight: 'bold',
                                                padding: '10px 20px',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                '&:hover': {
                                                  background: 'linear-gradient(45deg, #66bb6a, #2e7d32)', // Lighter green to darker green on hover
                                                  transform: 'scale(1.05)',
                                                  boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
                                                },
                                                '&:active': {
                                                  transform: 'scale(0.98)',
                                                },
                                                marginRight: '10px', // Space between buttons
                                              }}
                                            >
                                              View Invoice
                                            </Button>

                                            {/* Pay Button */}
                                            <Button
                                              className="btn-pay"
                                              sx={{
                                                background: 'linear-gradient(45deg, #ffd54f, #ffca28)', // Yellow tones to complement green
                                                color: 'black',
                                                fontWeight: 'bold',
                                                padding: '10px 20px',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                '&:hover': {
                                                  background: 'linear-gradient(45deg, #ffca28, #ffd54f)', // Reverse gradient on hover
                                                  transform: 'scale(1.05)',
                                                  boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
                                                },
                                                '&:active': {
                                                  transform: 'scale(0.98)',
                                                },
                                              }}
                                            >
                                              Pay
                                            </Button>
                                          </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={transactions.length} // Total records count
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                        position: 'relative',
                        top: '-50px',
                        marginBottom: 5,
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                />
            </Container>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
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
