import { Table, TableBody, TableCell, TableHead, TableRow, Box, Toolbar, Container, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Button, TablePagination, Checkbox, Typography, Select, MenuItem, TextField } from '@mui/material';
import ViewIcon from '@mui/icons-material/Visibility';
import UpdateIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import '../css/transaction.css';
import { useEffect, useState } from 'react';
import Filters from '../components/Filters';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';
import { formatMoney, generateInvoiceNumber } from '../utils/helper';
import EditTransactionModal from '../components/EditTransactionModal';
import { deleteTransaction, createPayment, addTransaction, getTransactionsByInvoiceNumber } from '../utils/backend';
import InvoiceDialog from '../components/InvoiceDialog';

const Transaction = () => {
    const { setSingleTransaction, user } = useStateContext();
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [transactionsByInvoice, setTransactionsByInvoice] = useState([]);
    const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fee, setFee] = useState('');
    const [openPayDialog, setOpenPayDialog] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentTerm, setPaymentTerm] = useState('');
    const [customAmount, setCustomAmount] = useState('');
    const [receiptNumber, setReceiptNumber] = useState('');
    const [selectedTransactionToPay, setSelectedTransactionToPay] = useState(null);
    const navigate = useNavigate();
    // Pagination states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(user.userType === 'client' ? 10 : 5);

    // State for managing confirmation dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    // State for managing checkboxes visibility
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [doneSendToClient, setDoneSendToClient] = useState(false);
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
    const handlePayButtonClick = (transaction) => {
      setSelectedTransactionToPay(transaction);
        setOpenPayDialog(true); // Show the pay dialog
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

    const handleViewInvoice = (invoiceNumber) => {
      getTransactionsByInvoiceNumber(setError, setTransactionsByInvoice, { invoiceNumber });
      setOpenInvoiceDialog(true);
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
          amount: totalAmount + calculatedFee,
          invoiceNumber: generateInvoiceNumber(),
          fee:calculatedFee,
          selectedTransactions:Array.from(selectedTransactions)
        }

        addTransaction(payload, setError);
        setDoneSendToClient(true);
        alert("Selected transactions have been sent to the client.");
        
    };
    
    useEffect(() => {
      if (doneSendToClient) {
        location.reload();
        setDoneSendToClient(false);
      }
    }, [doneSendToClient]);

    const handleConfirmPayment = async () => {
      // Validate payment details before proceeding (you can add custom validation if needed)
      if (!paymentMethod || !paymentTerm || !receiptNumber) {
          alert('Please fill all the required fields.');
          return;
      }
  
      let paymentAmount = 0;
  
      // Determine payment amount based on payment term
      if (paymentTerm === 'full') {
          paymentAmount = selectedTransactionToPay.amount; // Full payment uses the full amount
      } else if (paymentTerm === 'half') {
          paymentAmount = selectedTransactionToPay.amount / 2; // Half payment uses half the amount
      } else if (paymentTerm === 'partial') {
          // Partial payment uses the custom amount entered by the user
          paymentAmount = parseFloat(customAmount);
          if (isNaN(paymentAmount) || paymentAmount <= 0) {
              alert('Please enter a valid amount for partial payment.');
              return;
          }
      }
  
      try {
          const paymentData = {
              transactionID: selectedTransactionToPay.id, // Use the selected transaction ID
              clientID: selectedTransactionToPay.clientID,
              projectID: selectedTransactionToPay.projectID,
              paymentMethod,
              paymentTerm,
              receiptNumber,
              amount: paymentAmount, // Use the calculated amount based on the payment term
              status: 'Pending',
          };
  
          // Call the backend API to create the payment
          await createPayment(paymentData, setError,(message) => alert(message));
          setOpenPayDialog(false); // Close the dialog after confirmation
          //window.location.reload(); // Reload to reflect changes
  
      } catch (error) {
          setError('Failed to process payment.');
      }
  };
  
  console.log(transactionsByInvoice)

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
                            sx={{ marginBottom: 2, marginTop:2 }}
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
                                    SEND INVOICE
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
                            <TableCell><span className='transaction-header'>FEE</span></TableCell>
                            {user.userType !== 'client' && <TableCell><span className='transaction-header'>STATUS</span></TableCell>}
                            <TableCell><span className='transaction-header'>ACTIONS</span></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={user.userType === 'client' ? 5 : 11} align="center"><CircularProgress /></TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={user.userType === 'client' ? 5 : 11} align="center">No Records Found</TableCell>
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
                                        <TableCell><span className='transaction-content'>{formatMoney(parseFloat(transaction.fee || 0))}</span></TableCell>
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
                                            {/* Check if transaction is 'Receivable' */}
                                            {transaction.transactionType === 'Receivable' && (
                                              <>
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
                                                  onClick={() => {handleViewInvoice(transaction.invoice_number)}}
                                                >
                                                  View Invoice
                                                </Button>

                                                {/* Pay Button */}
                                                {transaction.status !== 'Settled' && <Button
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
                                                  onClick={() => handlePayButtonClick(transaction)}
                                                >
                                                  Pay
                                                </Button>}
                                                {transaction.status === 'Settled' && 'PAID'}
                                              </>
                                            )}
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

            <Dialog open={openPayDialog} onClose={() => setOpenPayDialog(false)}>
              <DialogTitle>Make Payment</DialogTitle>
              <DialogContent>
                  <Select
                      fullWidth
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      displayEmpty
                      sx={{ marginBottom: 2 }}
                  >
                      <MenuItem value="" disabled>Select Payment Method</MenuItem>
                      <MenuItem value="Cash">Cash</MenuItem>
                      <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                      <MenuItem value="Mobile Payment">Mobile Payment</MenuItem>
                  </Select>

                  <Select
                      fullWidth
                      value={paymentTerm}
                      onChange={(e) => setPaymentTerm(e.target.value)}
                      displayEmpty
                      sx={{ marginBottom: 2 }}
                  >
                      <MenuItem value="" disabled>Select Payment Term</MenuItem>
                      <MenuItem value="full">Full Payment</MenuItem>
                      <MenuItem value="half">Half Payment</MenuItem>
                      <MenuItem value="partial">Partial Payment</MenuItem>
                  </Select>

                  {paymentTerm === 'partial' && (
                      <TextField
                          fullWidth
                          label="Amount"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          sx={{ marginBottom: 2 }}
                      />
                  )}

                  <TextField
                      fullWidth
                      label="Receipt Number"
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                      sx={{ marginBottom: 2 }}
                  />
              </DialogContent>
              <DialogActions>
                  <Button onClick={() => setOpenPayDialog(false)} color="secondary">
                      Cancel
                  </Button>
                  <Button 
                      onClick={async () => await handleConfirmPayment()} 
                      color="primary">
                      Confirm Payment
                  </Button>
              </DialogActions>
          </Dialog>

            
            <InvoiceDialog
              open={openInvoiceDialog}
              onClose={() => setOpenInvoiceDialog(false)}
              transactionsByInvoice={transactionsByInvoice}
            />


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
