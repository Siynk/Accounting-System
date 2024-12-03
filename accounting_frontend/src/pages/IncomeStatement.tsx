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
    const [selectionMode, setSelectionMode] = useState('month');  // 'month' or 'year'
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const { user } = useStateContext();

    const currentYear = new Date().getFullYear();

    useEffect(() => {
        if (user && user.userType === 'client') {
            setCompanyName(user.company);
        }
    }, [user]);

    // Generate the date range based on user selection
    const calculateDateRange = useCallback(() => {
        let startDate, endDate;

        if (selectionMode === 'month') {
            // Set date range for the selected month and year
            const firstDay = new Date(selectedYear, selectedMonth, 1);
            const lastDay = new Date(selectedYear, selectedMonth + 1, 0); // Last day of the month
            startDate = firstDay.toISOString().split('T')[0];
            endDate = lastDay.toISOString().split('T')[0];
        } else if (selectionMode === 'year') {
            // Set date range for the selected year
            const firstDay = new Date(selectedYear, 0, 1); // January 1st
            const lastDay = new Date(selectedYear, 11, 31); // December 31st
            startDate = firstDay.toISOString().split('T')[0];
            endDate = lastDay.toISOString().split('T')[0];
        }

        setDateFrom(startDate);
        setDateTo(endDate);
    }, [selectionMode, selectedMonth, selectedYear]);

    useEffect(() => {
        if (selectedYear) {
            calculateDateRange();
        }
    }, [selectedMonth, selectedYear, selectionMode, calculateDateRange]);

    const handleGenerate = useCallback(() => {
        const params = {
            companyName,
            dateFrom,
            dateTo,
            rangeType: selectionMode, // Pass the selection mode as rangeType
        };
        console.log(params);
        generateIncomeStatement(setError, setIncomeStatement, params);
    }, [companyName, dateFrom, dateTo, selectionMode]);

    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=600,width=800');

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
                        <select
                            value={selectionMode}
                            onChange={(e) => setSelectionMode(e.target.value)}
                            className="incomeStatement-input"
                        >
                            <option value="month">By Month</option>
                            <option value="year">By Year</option>
                        </select>

                        {selectionMode === 'month' && (
                            <>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="incomeStatement-input"
                                    style={{width:'120%'}}
                                >
                                    <option value="">Select Month</option>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i}>
                                            {new Date(0, i).toLocaleString('en', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="incomeStatement-input"
                                    style={{width:'120%'}}
                                >
                                    <option value="">Select Year</option>
                                    {Array.from({ length: currentYear - 1900 }, (_, i) => (
                                        <option key={i} value={currentYear - i}>
                                            {currentYear - i}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}

                        {selectionMode === 'year' && (
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="incomeStatement-input"
                                style={{width:'120%'}}
                            >
                                <option value="">Select Year</option>
                                {Array.from({ length: currentYear - 1900 }, (_, i) => (
                                    <option key={i} value={currentYear - i}>
                                        {currentYear - i}
                                    </option>
                                ))}
                            </select>
                        )}

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
                            <tr className="total-header-net">
                                <td>Income Tax</td>
                                <td>{formatAmount(incomeStatement.incomeTax)}</td>
                            </tr>
                            <tr className="total-header-net">
                                <td>Net Income After Tax</td>
                                <td>{formatAmount(incomeStatement.netIncomeAfterTax)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Container>
        </Box>
    );
};

export default IncomeStatement;
