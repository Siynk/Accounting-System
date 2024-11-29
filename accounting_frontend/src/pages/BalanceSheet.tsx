import React, { useCallback, useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import '../css/reports.css';
import { generateBalanceSheet } from '../utils/backend';
import { useStateContext } from '../context/ContextProvider';

const BalanceSheet = () => {
    const [balanceSheet, setBalanceSheet] = useState({});
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
    console.log(balanceSheet)
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
            printWindow.document.write('<style>body { font-family: Arial, sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(document.querySelector('.balanceSheet-content').innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        } else {
            console.error('Failed to open print window');
        }
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
                            {balanceSheet.assets && balanceSheet.assets.length > 0 ? (
                                balanceSheet.assets.map((asset, index) => (
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
