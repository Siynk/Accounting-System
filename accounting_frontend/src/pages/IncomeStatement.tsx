import React, { useCallback, useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import '../css/reports.css';
import { generateIncomeStatement } from '../utils/backend';
import { useStateContext } from '../context/ContextProvider';

const IncomeStatement = () => {
    const [incomeStatement, setIncomeStatement] = useState({});
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
        console.log(params);
        generateIncomeStatement(setError, setIncomeStatement, params);
    }, [companyName, dateFrom, dateTo]);

    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        
        // Check if the printWindow was opened successfully
        if (printWindow) {
            printWindow.document.write('<html><head><title>Segment Report</title>');
            printWindow.document.write('<style>body { font-family: Arial, sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(document.querySelector('.incomeStatement-content').innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        } else {
            console.error('Failed to open print window');
        }
    };

    const formatAmount = (amount) => {
        return amount ? `₱${parseFloat(amount).toLocaleString()}` : '₱0';
    };

    const renderSection = (title, data, totalKey) => (
        <>
            <tr>
                <td colSpan="2" className="sub-header">{title}</td>
            </tr>
            {data && data.length > 0 ? (
                data.map((item, index) => (
                    <tr key={index}>
                        <td>{item.description}</td>
                        <td>{formatAmount(item.amount)}</td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="2" className="no-record">No Record</td>
                </tr>
            )}
            <tr className="total-header">
                <td>Total {title}</td>
                <td>{formatAmount(incomeStatement[totalKey])}</td>
            </tr>
        </>
    );

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
            <Container maxWidth="xl" className="incomeStatement-container">
                <div className="incomeStatement-header">
                    <h1>Generate Income Statement</h1>
                    <div className="incomeStatement-inputs">
                    {/* {user.userType !== 'client' && <input
                            type="text"
                            placeholder="Enter Company Name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="incomeStatement-input"
                        />} */}
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="incomeStatement-input"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="incomeStatement-input"
                        />
                        <button onClick={handleGenerate} className="incomeStatement-button">
                            Generate
                        </button>
                        <button className="incomeStatement-button print-button" onClick={handlePrint}>
                            Print
                        </button>
                    </div>
                </div>
                <div className="incomeStatement-content">
                    <h2 className="incomeStatement-title">Income Statement</h2>
                    <table className="income-statement-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Amount (₱)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderSection('Revenues', incomeStatement.revenues, 'totalRevenue')}
                            {renderSection('Operating Expenses', incomeStatement.operatingExpenses, 'totalOperatingExpenses')}
                            {renderSection('Financing Expenses', incomeStatement.financingExpenses, 'totalFinancingExpenses')}
                            {renderSection('Investing Expenses', incomeStatement.investingExpenses, 'totalInvestingExpenses')}
                            <tr className="total-header-net">
                                <td>Net Income</td>
                                <td>{formatAmount(incomeStatement.netIncome)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Container>
        </Box>
    );
};

export default IncomeStatement;
