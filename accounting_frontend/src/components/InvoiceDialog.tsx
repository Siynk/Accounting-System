import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Divider, Grid } from '@mui/material';
import { formatMoney } from '../utils/helper'; // Ensure you have this utility function
import React from 'react';
import dayjs from 'dayjs';

const InvoiceDialog = ({ open, onClose, transactionsByInvoice }) => {
  // Convert transactions to an array
  const invoice = Object.values(transactionsByInvoice);

  // Separate the "Invoice" transaction from the rest
  const invoiceTransaction = invoice.find(transaction => transaction.description === 'Invoice');
  const otherTransactions = invoice.filter(transaction => transaction.description !== 'Invoice');

  // Get the invoice number, client company, and project name
  const invoiceNumber = invoiceTransaction?.invoice_number;
  const clientCompany = invoiceTransaction?.company;
  const projectName = invoiceTransaction?.projectName;

  // Calculate the total amount (only from the "Invoice" transaction)
  const totalAmount = parseFloat(invoiceTransaction?.amount || 0);
  const fee = parseFloat(invoiceTransaction?.fee || 0);  // Get the fee from the invoiceTransaction

  const handlePrint = () => {
    const content = document.getElementById('invoice-print-content').innerHTML;
    const win = window.open('', '', 'height=500,width=800');
    
    win.document.write('<html><head><title>Invoice</title>');
    win.document.write('<style>');
    win.document.write(`
      body {
        font-family: 'Courier New', monospace; /* Common receipt font family */
        margin: 0;
        padding: 8px; /* Reduced padding */
        background-color: #ffffff; /* Removed background color */
        color: #000; /* Black text color */
        font-size: 0.8em; /* Reduced font size */
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 10px; /* Reduced padding */
        background-color: #ffffff; /* Removed background color */
        border-radius: 6px; /* Reduced border radius */
        box-shadow: none; /* Removed box shadow */
      }
  
      .invoice-header-company,
      .invoice-header-project {
        font-size: 1.3em; /* Smaller header text */
        font-weight: 600;
        color: #000; /* Default text color */
        margin-bottom: 5px; /* Reduced margin */
      }
      .invoice-header-project {
        margin-top: 5px; /* Reduced margin */
      }
      .invoice-header-divider {
        margin-bottom: 10px; /* Reduced divider margin */
        border: none; /* Removed divider line */
      }
  
      .invoice-details {
        padding: 10px; /* Reduced padding */
        border-radius: 5px; /* Reduced border radius */
        margin-bottom: 15px; /* Reduced margin */
      }
      .invoice-details-title {
        font-size: 1.1em; /* Slightly smaller title */
        font-weight: bold;
        margin-bottom: 6px; /* Reduced margin */
      }
      .invoice-details-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 8px; /* Reduced gap */
        margin-top: 3px; /* Reduced margin between sections */
      }
      .invoice-details-grid div {
        margin-bottom: 4px; /* Reduced margin */
      }
      .invoice-description,
      .invoice-balance,
      .invoice-status,
      .invoice-date,
      .invoice-fee {
        font-size: 0.9em; /* Smaller text */
        margin-bottom: 4px; /* Reduced margin for description */
      }
      .invoice-balance {
        text-align: right;
      }
      .invoice-date {
        text-align: right;
      }
      .invoice-fee {
        text-align: right;
        width:152.5%; /* Adjust width to fit content */
      }
  
      .transactions-title {
        font-size: 1.1em; /* Slightly smaller title */
        font-weight: 600;
        margin-top: 12px; /* Reduced margin above the title */
      }
      .transaction-box {
        margin-bottom: 12px; /* Reduced margin */
        padding: 10px; /* Reduced padding */
        border-radius: 5px; /* Reduced border radius */
        border: none; /* Removed border */
      }
      .transaction-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 8px; /* Reduced gap */
        margin-top: 5px;
      }
      .transaction-grid div {
        display: flex;
        justify-content: space-between;
      }
      .transaction-description,
      .transaction-amount,
      .transaction-status,
      .transaction-date {
        font-size: 0.9em; /* Smaller text */
        margin-bottom: 4px; /* Reduced margin for description */
      }
      .transaction-materials-title {
        font-size: 1em; /* Slightly smaller title */
        margin-top: 8px; /* Reduced margin */
        font-weight: bold;
      }
      .transaction-material-box {
        padding: 6px; /* Reduced padding */
        background-color: #ffffff;
        border-radius: 5px; /* Reduced border radius */
        margin-bottom: 6px; /* Reduced margin */
      }
      .transaction-material-divider {
        margin: 6px 0; /* Reduced margin */
      }
      .transaction-material-grid {
        display: grid;
        grid-template-columns: 3fr 2fr 1fr; /* Adjust columns for materials */
        gap: 8px; /* Reduced gap */
      }
      .transaction-material-grid div {
        display: flex;
        justify-content: space-between;
      }
      .material-name,
      .material-price,
      .material-quantity {
        font-size: 0.8em; /* Even smaller text */
      }
  
      .total-amount-section {
        margin-top: 20px; /* Reduced margin */
        padding: 10px; /* Reduced padding */
        border-radius: 5px; /* Reduced border radius */
      }
      .total-amount-balance {
        font-size: 1.1em; /* Slightly smaller balance text */
        font-weight: bold;
        text-align: right;
      }
  
      .footer {
        text-align: center;
        font-size: 0.8em; /* Smaller footer text */
        margin-top: 20px; /* Reduced margin */
        color: #000; /* Black footer text */
      }
    `);
    win.document.write('</style>');
    win.document.write('</head><body>');
    win.document.write(`<div class="container">${content}</div>`);
    win.document.write('<div class="footer">Thank you for your business!</div>');
    win.document.write('</body></html>');
    win.document.close();
    win.print();
};

  
  
  
  

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontFamily: 'Roboto, sans-serif' }}>Invoice: {invoiceNumber}</DialogTitle>
      <DialogContent sx={{ fontFamily: 'Roboto, sans-serif' }}>
        <Box sx={{ padding: 3 }}>
        <div id="invoice-print-content">
  {/* Invoice Header */}
  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }} className="invoice-header-company">
    {clientCompany}
  </Typography>
  <Typography variant="subtitle1" color="textSecondary" gutterBottom className="invoice-header-project">
    Project: {projectName}
  </Typography>

  <Divider sx={{ marginBottom: 2 }} className="invoice-header-divider" />

  {/* Invoice Details (Only the Invoice transaction) */}
  {invoiceTransaction && (
    <Box sx={{ marginBottom: 3, background: 'linear-gradient(to right, #f0f0f0, #ffffff)', padding: 2, borderRadius: 2 }} className="invoice-details">
      <Typography variant="h6" gutterBottom className="invoice-details-title">
        Invoice Details:
      </Typography>
      <Grid container spacing={2} className="invoice-details-grid">
        <Grid item xs={6}>
          <Typography variant="body1" className="invoice-description">
            <strong>Description:</strong> {invoiceTransaction.description}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1" textAlign="right" className="invoice-balance">
            <strong>Balance:</strong> {formatMoney(totalAmount)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="textSecondary" className="invoice-status">
            <strong>Status:</strong> {invoiceTransaction.status}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="textSecondary" textAlign="right" className="invoice-date">
            <strong>Date:</strong> {dayjs(invoiceTransaction.transactionDate).format('MM-DD-YYYY')}
          </Typography>
        </Grid>
        {/* Display the fee */}
        {fee > 0 && (
          <Grid item xs={12} className="invoice-fee">
            <Typography variant="body1" color="textSecondary" textAlign="right">
              <strong>Fee:</strong> {formatMoney(fee)}
            </Typography>
          </Grid>
        )}
      </Grid>
      <Divider sx={{ marginTop: 1, marginBottom: 1 }} className="invoice-details-divider" />
    </Box>
  )}

  {/* Transactions Section */}
  {otherTransactions.length > 0 && (
    <>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }} className="transactions-title">
        Transactions:
      </Typography>
      {otherTransactions.map((transaction) => (
        <Box key={transaction.id} sx={{ marginBottom: 2 }} className="transaction-box">
          <Grid container spacing={2} className="transaction-grid">
            <Grid item xs={6}>
              <Typography variant="body1" className="transaction-description">
                <strong>Description:</strong> {transaction.description}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" textAlign="right" className="transaction-amount">
                <strong>Amount:</strong> {formatMoney(parseFloat(transaction.amount))}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary" className="transaction-status">
                <strong>Status:</strong> {transaction.status}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary" textAlign="right" className="transaction-date">
                <strong>Date:</strong> {dayjs(transaction.transactionDate).format('MM-DD-YYYY')}
              </Typography>
            </Grid>
          </Grid>

          {/* Display materials only if valid */}
          {transaction.materials && transaction.materials.length > 0 && (
            <>
              <Typography variant="body1" sx={{ marginTop: 2 }} className="transaction-materials-title"><strong>Materials:</strong></Typography>
              {transaction.materials.map((material, index) => (
                // Only display valid materials
                (material.name && material.price && material.quantity) ? (
                  <Box key={index} sx={{ marginBottom: 1 }} className="transaction-material-box">
                    <Divider sx={{ marginBottom: 1 }} className="transaction-material-divider" /> {/* Divider between materials */}
                    <Grid container spacing={2} className="transaction-material-grid">
                      <Grid item xs={4}>
                        <Typography variant="body2" className="material-name">
                          <strong>Name:</strong> {material.name || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" className="material-price">
                          <strong>Price:</strong> {material.price ? formatMoney(parseFloat(material.price)) : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" className="material-quantity">
                          <strong>Quantity:</strong> {material.quantity || 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider sx={{ marginTop: 1 }} className="transaction-material-divider" /> {/* Divider after each material */}
                  </Box>
                ) : null
              ))}
            </>
          )}

          <Divider sx={{ marginTop: 1, marginBottom: 1 }} className="transaction-divider" />
        </Box>
      ))}
    </>
  )}

  {/* Total Amount Section */}
  <Box sx={{ marginTop: 3, marginBottom: 2, background: 'linear-gradient(to right, #e0f7fa, #ffffff)', padding: 2, borderRadius: 2 }} className="total-amount-section">
    <Typography variant="h6" color="primary" textAlign="right" className="total-amount-balance">
      Balance: {formatMoney(totalAmount)}
    </Typography>
  </Box>
</div>

        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          color="primary" 
          sx={{
            background: 'linear-gradient(to right, #3f51b5, #3f8efc)',
            color: 'white',
            fontFamily: 'Roboto, sans-serif',
            borderRadius: '25px',
            padding: '8px 20px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              background: 'linear-gradient(to right, #303f9f, #3f51b5)',
              boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
              transform: 'scale(1.05)',
            },
            '&:active': {
              background: '#1e3c7a',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              transform: 'scale(1)',
            },
          }}
        >
          Close
        </Button>
        {/* Print Button */}
        <Button 
          onClick={handlePrint} 
          sx={{
            background: 'linear-gradient(to right, #4caf50, #8bc34a)',
            color: 'white',
            fontFamily: 'Roboto, sans-serif',
            borderRadius: '25px',
            padding: '8px 20px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              background: 'linear-gradient(to right, #66bb6a, #4caf50)',
              boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
              transform: 'scale(1.05)',
            },
            '&:active': {
              background: '#388e3c',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              transform: 'scale(1)',
            },
          }}
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceDialog;
