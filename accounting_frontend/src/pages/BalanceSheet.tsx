import React, { useCallback, useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import '../css/reports.css';
import { generateBalanceSheet } from '../utils/backend';
import { useStateContext } from '../context/ContextProvider';
import logo from '../assets/logo-removebg-preview.png';

const BalanceSheet = () => {
    const [balanceSheet, setBalanceSheet] = useState({});
    const [normalizedBalanceSheet, setNormalizedBalanceSheet] = useState({});
    const [companyName, setCompanyName] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [error, setError] = useState(null);
    const { user } = useStateContext();

    useEffect(() => {
        if (user && user.userType === 'client') {
            setCompanyName(user.company);
        }
    }, [user]);
 
    const handleGenerate = useCallback(() => {
        const params = {
            companyName,
            dateFrom,
            dateTo
        };
        generateBalanceSheet(setError, setBalanceSheet, params);
    }, [companyName, dateFrom, dateTo]);

    const handlePrint = () => {
      const printWindow = window.open('', '', 'height=600,width=800');
  
      // Check if the printWindow was opened successfully
      if (printWindow) {
          printWindow.document.write('<html><head><title>Balance Sheet</title>');
          
          // Styling for the print layout
          printWindow.document.write(`
              <style>
                  body { 
                      font-family: Arial, sans-serif; 
                      margin: 0; 
                      padding: 20px; 
                      line-height: 1.6; 
                  }
                  .balanceSheet-container { 
                      width: 100%; 
                      max-width: 800px; 
                      margin: 0 auto; 
                  }
                  .balanceSheet-header { 
                      text-align: center; 
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      margin-bottom: 20px; 
                  }
                  .balanceSheet-title { 
                      font-size: 24px; 
                      font-weight: bold; 
                      margin: 0;
                      text-align: left;
                      flex-grow: 1;
                  }
                  .balanceSheet-logo { 
                      width: 80px; 
                      height: auto; 
                      margin-left: 20px;
                  }
                  .balanceSheet-section { 
                      margin-bottom: 10px; 
                  }
                  .balanceSheet-section-title { 
                      font-size: 18px; 
                      font-weight: bold; 
                      margin-bottom: 5px; 
                      text-transform: uppercase;
                  }
                  .balanceSheet-item { 
                      margin-bottom: 5px; 
                      display: flex; 
                      justify-content: space-between;
                      align-items: center;
                  }
                  .balanceSheet-item-date { 
                      font-size: 12px; 
                      color: #555; 
                      margin-left: 10px;
                  }
                  .balanceSheet-item-description { 
                      font-size: 16px; 
                      font-weight: normal;
                      flex-grow: 1;
                  }
                  .balanceSheet-item-amount { 
                      font-size: 16px; 
                      font-weight: normal; 
                      text-align: right;
                      min-width: 120px;
                  }
                  .balanceSheet-total { 
                      font-weight: bold; 
                      font-size: 18px; 
                      margin-top: 10px; 
                      display: flex;
                      justify-content: flex-end; /* Align totals to the right */
                      text-align: right; /* Ensure text is aligned right */
                  }
                  .balanceSheet-check { 
                      font-weight: bold; 
                      font-size: 16px; 
                      display: flex;
                      justify-content: space-between;
                      margin-top: 15px;
                  }
                  .balanceSheet-check-true { 
                      color: green; 
                  }
                  .balanceSheet-check-false { 
                      color: red; 
                  }
                  .approved-section {
                      position: absolute;
                      bottom: 20px;
                      right: 20px;
                      font-size: 12px;
                      text-align: right;
                      font-style: italic;
                  }
              </style>
          `);
  
          printWindow.document.write('</head><body>');
          
          // Add the logo and title side by side
          printWindow.document.write('<div class="balanceSheet-header">');
          printWindow.document.write(`<h1 class="balanceSheet-title">Balance Sheet</h1>`);
          printWindow.document.write(`<img src="${logo}" class="balanceSheet-logo" />`);
          printWindow.document.write('</div>');
          
          // Company name and formatted date range
          printWindow.document.write('<p><strong>Company Name:</strong> ' + companyName + '</p>');
          
          // Format the date range (e.g., "December 10, 2024")
          const formatDate = (dateStr) => {
              const date = new Date(dateStr);
              const options = { year: 'numeric', month: 'long', day: 'numeric' };
              return date.toLocaleDateString('en-US', options); // Format: Month Day, Year
          };
          
          printWindow.document.write('<p><strong>Date Range:</strong> ' + formatDate(dateFrom) + ' to ' + formatDate(dateTo) + '</p>');
  
          // Assets Section
          printWindow.document.write('<div class="balanceSheet-section">');
          printWindow.document.write('<div class="balanceSheet-section-title">Assets</div>');
          if (normalizedBalanceSheet.assets && normalizedBalanceSheet.assets.length > 0) {
              normalizedBalanceSheet.assets.forEach(asset => {
                  printWindow.document.write('<div class="balanceSheet-item">');
                  printWindow.document.write('<div class="balanceSheet-item-description">' + asset.description + (asset.transactionType === 'Receivable' ? ' (Accounts Receivable)' : '') + '</div>');
                  printWindow.document.write('<div class="balanceSheet-item-amount">₱' + parseFloat(asset.amount).toLocaleString() + '</div>');
                  printWindow.document.write('<div class="balanceSheet-item-date">' + formatDate(asset.date) + '</div>');
                  printWindow.document.write('</div>');
              });
          } else {
              printWindow.document.write('<div>No assets to display</div>');
          }
          printWindow.document.write('<div class="balanceSheet-total">Total Assets: ₱' + (balanceSheet.totalAssets?.toLocaleString() || 0) + '</div>');
          printWindow.document.write('</div>');
  
          // Liabilities Section
          printWindow.document.write('<div class="balanceSheet-section">');
          printWindow.document.write('<div class="balanceSheet-section-title">Liabilities</div>');
          if (balanceSheet.liabilities && balanceSheet.liabilities.length > 0) {
              balanceSheet.liabilities.forEach(liability => {
                  printWindow.document.write('<div class="balanceSheet-item">');
                  printWindow.document.write('<div class="balanceSheet-item-description">' + liability.description + '</div>');
                  printWindow.document.write('<div class="balanceSheet-item-amount">₱' + parseFloat(liability.amount).toLocaleString() + '</div>');
                  printWindow.document.write('<div class="balanceSheet-item-date">' + formatDate(liability.date) + '</div>');
                  printWindow.document.write('</div>');
              });
          } else {
              printWindow.document.write('<div>No liabilities to display</div>');
          }
          printWindow.document.write('<div class="balanceSheet-total">Total Liabilities: ₱' + (balanceSheet.totalLiabilities?.toLocaleString() || 0) + '</div>');
          printWindow.document.write('</div>');
  
          // Equity Section
          printWindow.document.write('<div class="balanceSheet-section">');
          printWindow.document.write('<div class="balanceSheet-section-title">Owner\'s Equity</div>');
          printWindow.document.write('<div class="balanceSheet-item">');
          printWindow.document.write('<div class="balanceSheet-item-description">Owner\'s Equity</div>');
          printWindow.document.write('<div class="balanceSheet-item-amount">₱' + (balanceSheet.ownerEquity?.toLocaleString() || 0) + '</div>');
          printWindow.document.write('</div>');
          printWindow.document.write('<div class="balanceSheet-total">Total Liabilities + Total Equity: ₱' + (balanceSheet.totalLiabilitiesPlusTotalEquity?.toLocaleString() || 0) + '</div>');
          printWindow.document.write('</div>');
  
          // Balance Check
          printWindow.document.write('<div class="balanceSheet-check">');
          printWindow.document.write('<div>BALANCE CHECK:</div>');
          printWindow.document.write('<div class="' + (balanceSheet.totalAssets === balanceSheet.totalLiabilitiesPlusTotalEquity ? 'balanceSheet-check-true' : 'balanceSheet-check-false') + '">' +
              (balanceSheet.totalAssets === balanceSheet.totalLiabilitiesPlusTotalEquity ? 'BALANCED' : 'NOT BALANCED') +
              '</div>');
          printWindow.document.write('</div>');
  
          // "Approved by" Section
          printWindow.document.write('<div class="approved-section">');
          printWindow.document.write('<p>Approved by: _______________________</p>');
          printWindow.document.write('<p>Date: _______________________________</p>');
          printWindow.document.write('</div>');
  
          printWindow.document.write('</body></html>');
          printWindow.document.close();
          setTimeout(() => {
              printWindow.print();
          }, 500);
          
      } else {
          console.error('Failed to open print window');
      }
  };
  
  
  
  
  
  

    useEffect(() => {
      if(balanceSheet.assets){
        const updatedAssets = balanceSheet.assets.filter(asset => asset.amount !== "0");
  
      // Update the balance sheet with the filtered assets
      setNormalizedBalanceSheet(prevState => ({
        ...prevState,
        assets: updatedAssets,
      }));
      }
    }, [balanceSheet]);
    

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
                margin: 'auto',
            }}
        >
            <Container maxWidth="xl" className="balanceSheet-container">
                <div className="balanceSheet-header">
                    <h1>Generate Balance Sheet</h1>
                    <div className="balanceSheet-inputs">
                    {/* {user.userType !== 'client' && <input
                            type="text"
                            placeholder="Enter Company Name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="balanceSheet-input"
                        />} */}
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="balanceSheet-input"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="balanceSheet-input"
                        />
                        <button onClick={handleGenerate} className="balanceSheet-button">
                            Generate
                        </button>
                        <button className="balanceSheet-button print-button" onClick={handlePrint}>
                            Print
                        </button>
                    </div>
                </div>

                <div className="balanceSheet-content">
                    <h2 className="balanceSheet-title">Balance Sheet</h2>
                    <table className="balanceSheet-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Amount (₱)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Assets */}
                            <tr className="balanceSheet-subheader-asset">
                                <td>Assets</td>
                                <td></td>
                            </tr>
                            {normalizedBalanceSheet.assets && normalizedBalanceSheet.assets.length > 0 ? (
                                normalizedBalanceSheet.assets.map((asset, index) => (
                                    <tr key={index} className="balanceSheet-asset">
                                        <td>{asset.description}{asset.transactionType === 'Receivable' && ' (Accounts Receivable)'}</td>
                                        <td>₱{parseFloat(asset.amount).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2">No Record</td>
                                </tr>
                            )}
                            <tr className="balanceSheet-total">
                                <td>Total Assets</td>
                                <td>₱{balanceSheet.totalAssets?.toLocaleString()||0}</td>
                            </tr>

                            {/* Liabilities */}
                            <tr className="balanceSheet-subheader-liability">
                                <td>Liabilities</td>
                                <td></td>
                            </tr>
                            {balanceSheet.liabilities && balanceSheet.liabilities.length > 0 ? (
                                balanceSheet.liabilities.map((liability, index) => (
                                    <tr key={index} className="balanceSheet-liability">
                                        <td>{liability.description}</td>
                                        <td>₱{parseFloat(liability.amount).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2">No Record</td>
                                </tr>
                            )}
                            <tr className="balanceSheet-total">
                                <td>Total Liabilities</td>
                                <td>₱{balanceSheet.totalLiabilities?.toLocaleString()||0}</td>
                            </tr>

                            {/* Equity */}
                            <tr className="balanceSheet-subheader-equity">
                                <td>OWNER'S EQUITY</td>
                                <td>₱{balanceSheet.ownerEquity?.toLocaleString()||0}</td>
                            </tr>
                            <tr className="balanceSheet-subheader-equity">
                                <td>TOTAL LIABILITIES + TOTAL EQUITY</td>
                                <td>₱{balanceSheet.totalLiabilitiesPlusTotalEquity?.toLocaleString()||0}</td>
                            </tr>
                            <tr className="balanceSheet-balance-check">
                                <td style={{ fontWeight: 'bold', textAlign:'right' }}>BALANCE CHECK:</td>
                                <td style={{ fontWeight: 'bold', color: balanceSheet.totalAssets === balanceSheet.totalLiabilitiesPlusTotalEquity ? 'green' : 'red' }}>
                                    {balanceSheet.totalAssets === balanceSheet.totalLiabilitiesPlusTotalEquity ? 'BALANCED' : 'NOT BALANCED'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Container>
        </Box>
    );
};

export default BalanceSheet;
