import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Dialog, DialogActions, DialogContent, DialogTitle, TextField, TablePagination } from '@mui/material';
import { getAllPayments, updatePaymentStatus, addTransaction } from '../utils/backend';
import '../css/payment.css';
import { useStateContext } from '../context/ContextProvider';

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [openDeclineModal, setOpenDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const { user } = useStateContext();

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Adjust this value to change the number of rows per page

  // Fetch all payments on component mount
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getAllPayments(setError, setPayments);
      } catch (error) {
        setError('Failed to fetch payments');
      }
    };
    fetchPayments();
  }, []);

  // Handle Approve button click
  const handleApprove = async (payment) => {
    try {
      // Prepare the payload for creating a transaction
      const transactionData = {
        clientID: payment.client.id,
        projectID: payment.project.id,
        description: 'Payment for ' + payment.project.projectName,
        amount: payment.amount,
        category: 'Operating',
        cashFlow: 'Inflow', 
        productLine: payment.transaction.productLine,
        status: 'Approved',
        fee: 0,
        transactionTypes: [10] // Collect only the IDs
      };

      // Call the addTransaction function
      await addTransaction(transactionData, setError);

      // After approving, update payment status
      await handlePaymentStatusChange('Approved', payment.id, 'Approve', payment.client.id, payment.amount, payment.transactionID);
      
      // Optionally, refetch payments
      await getAllPayments(setError, setPayments);
    } catch (error) {
      setError('Failed to approve payment');
    }
  };

  // Handle updating payment status to Declined
  const handleDecline = (payment) => {
    setSelectedPayment(payment);
    setOpenDeclineModal(true);
  };

  console.log(payments)

  const handlePaymentStatusChange = async (status, paymentID, updateType, clientID, paymentAmount, transactionID) => {
    const payload = {
      status: status,
      paymentID: paymentID,
      clientID: clientID,
      paymentAmount: paymentAmount,  // Pass the payment amount
      transactionID: transactionID,  // Pass the transaction ID
      approverID: user.id
    };

    if(updateType === 'Decline'){
      payload.decline_reason = declineReason;
    }

    await updatePaymentStatus(payload, setError);
    setOpenDeclineModal(false); // Close modal after submitting
  };

  const handleDeclineReasonChange = (event) => {
    setDeclineReason(event.target.value);
  };

  const handleDeclineSubmit = async () => {
    if (declineReason.trim() === '') {
      setError('Decline reason is required');
      return;
    }
    handlePaymentStatusChange('Declined', selectedPayment.id, 'Decline', selectedPayment.client.id, selectedPayment.amount, selectedPayment.transactionID);
    await getAllPayments(setError, setPayments);
  };

  const cellStyle = {
    background: 'linear-gradient(45deg, #4caf50, #1b5e20)', // Green gradient background
    color: 'white',  // White text for contrast
    fontWeight: 'bold',  // Bold text to make it stand out
    padding: '12px',  // Increased padding for better spacing
    textAlign: 'center',  // Center-align text
    borderBottom: '3px solid #2c6e1f',  // Dark green border at the bottom
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)', // Box shadow for slight depth
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page change
  };

  // Slice payments based on the current page and rowsPerPage
  const paginatedPayments = payments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box
      component="main"
      sx={{
        backgroundColor: '#f5f5f5',
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
        padding: '24px',
      }}
    >
      <Toolbar />
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom>
          Payment Management
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={cellStyle}><strong>Client</strong></TableCell>
                <TableCell sx={cellStyle}><strong>Project</strong></TableCell>
                <TableCell sx={cellStyle}><strong>Handled By</strong></TableCell>
                <TableCell sx={cellStyle}><strong>Amount</strong></TableCell>
                <TableCell sx={cellStyle}><strong>Status</strong></TableCell>
                <TableCell sx={cellStyle}><strong>Receipt Number</strong></TableCell>
                <TableCell sx={cellStyle}><strong>Decline Reason</strong></TableCell>
                <TableCell sx={cellStyle}><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{payment.client.name}</TableCell>
                    <TableCell>{payment.project.projectName}</TableCell>
                    <TableCell>{payment.approver ? payment.approver.name : 'N/A'}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell sx={{color: payment.status === 'Approved' ? "green" : 'red'}}>{payment.status}</TableCell>
                    <TableCell>{payment.receipt_number || "N/A"}</TableCell>
                    <TableCell>{payment.declineReason || "N/A"}</TableCell>
                    <TableCell>
                      {payment.status === 'Pending' ? (
                        <div>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleApprove(payment)}
                            style={{ marginRight: '8px' }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleDecline(payment)}
                          >
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No action available
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">No payments found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={payments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Container>

      {/* Decline Reason Modal */}
      <Dialog open={openDeclineModal} onClose={() => setOpenDeclineModal(false)}>
        <DialogTitle>Decline Reason</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="declineReason"
            label="Reason for Decline"
            fullWidth
            variant="outlined"
            value={declineReason}
            onChange={handleDeclineReasonChange}
            error={Boolean(error)}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeclineModal(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeclineSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payment;
