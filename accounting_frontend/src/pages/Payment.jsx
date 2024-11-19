import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { getAllPayments, updatePaymentStatus, addTransaction } from '../utils/backend';
import '../css/payment.css';

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [openDeclineModal, setOpenDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);

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
  console.log(payments)

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
        cashFlow: 'Inflow', // Assuming outflow for payments
        productLine: 'General',
        status: 'Approved',
        transactionTypes: [10] // Collect only the IDs
      };

      // Call the addTransaction function
      await addTransaction(transactionData, setError);

      // After approving, update payment status
      await handlePaymentStatusChange('Approved', payment.id, 'Approve', payment.client.id);
      
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

  const handlePaymentStatusChange = async (status, paymentID, updateType, clientID) => {
    
    const payload = {
      status: status,
      paymentID: paymentID,
      clientID: clientID,
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
    handlePaymentStatusChange('Declined', selectedPayment.id, 'Decline', selectedPayment.client.id);
    await getAllPayments(setError, setPayments);
  };

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
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Payment Management
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{background:'darkgreen',color:'yellow'}}>
                <TableCell><strong>Client</strong></TableCell>
                <TableCell><strong>Project</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Decline Reason</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length > 0 ? (
                payments.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{payment.client.name}</TableCell>
                    <TableCell>{payment.project.projectName}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell sx={{color:payment.status === 'Approved' ? "green" : 'red'}}>{payment.status}</TableCell>
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
                  <TableCell colSpan={5} align="center">No payments found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
