import React, { useCallback, useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import '../css/reports.css';
import { generateIncomeStatement } from '../utils/backend';
import { useStateContext } from '../context/ContextProvider';
import logo from '../assets/logo-removebg-preview.png';

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
      // Function to format numbers as Peso currency
      const formatCurrency = (value) => {
          return new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
          }).format(value);
      };
  
      const printWindow = window.open('', '', 'height=600,width=800');
      
      // Check if the print window was opened successfully
      if (printWindow) {
          printWindow.document.write('<html><head><title>Income Statement</title>');
          printWindow.document.write('<style>');
          
          // Inline styles for print layout
          printWindow.document.write(`
              body {
                  font-family: Arial, sans-serif;
                  font-size: 12px;
                  margin: 0;
                  padding: 0;
                  background-color: #f9f9f9;
              }
              .container {
                  width: 100%;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                  box-sizing: border-box;
                  background-color: #ffffff;
                  border-radius: 10px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 10px;
                  width: 100%;
              }
              .header img {
                  height: 50px;
                  width: auto;
              }
              .title {
                  font-size: 20px;
                  font-weight: bold;
                  margin: 0;
              }
              .section {
                  margin-bottom: 20px;
                  width: 100%;
                  padding: 10px 0;
                  border-bottom: 1px solid #ddd;
              }
              .section-title {
                  font-weight: bold;
                  font-size: 14px;
                  color: #333;
                  margin-bottom: 10px;
              }
              .section-item {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 10px;
              }
              .section-item .description {
                  flex: 3;
                  padding-right: 10px;
                  font-size: 12px;
                  color: #555;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
              }
              .section-item .amount,
              .section-item .date {
                  width: 120px;
                  text-align: right;
                  font-size: 12px;
                  color: #555;
              }
              .totals {
                  margin-top: 30px;
                  text-align: right;
                  font-weight: bold;
                  border-top: 2px solid #000;
                  padding-top: 14px;
                  font-size: 14px;
              }
              .footer {
                  margin-top: 40px;
                  text-align: left;
                  font-size: 12px;
              }
              .footer .approved {
                  text-decoration: underline;
                  display: inline-block;
                  width: 200px;
                  margin-bottom: 5px;
              }
              .footer .signature {
                  margin-top: 5px;
              }
  
              /* Print-specific styles */
              @media print {
                  body {
                      background-color: #ffffff;
                  }
                  .container {
                      box-shadow: none;
                      padding: 10px;
                  }
                  .header img {
                      height: 40px;
                  }
              }
          `);
          
          printWindow.document.write('</style></head><body>');
          
          // Header with title and logo
          printWindow.document.write('<div class="container">');
          printWindow.document.write('<div class="header">');
          printWindow.document.write('<div class="title">Income Statement</div>');
          printWindow.document.write(`<img src="${logo}" alt="Logo">`);
          printWindow.document.write('</div>');
          
          // Render the revenues section
          const renderSection = (title, items) => {
              let sectionHtml = `<div class="section"><div class="section-title">${title}</div>`;
              
              items.forEach(item => {
                  const formattedDate = new Date(item.date).toLocaleDateString();
                  sectionHtml += `
                      <div class="section-item">
                          <div class="description">${item.description}</div>
                          <div class="amount">${formatCurrency(item.amount)}</div>
                          <div class="date">${formattedDate}</div>
                      </div>
                  `;
              });
              
              sectionHtml += '</div>';
              return sectionHtml;
          };
          
          // Render all sections: Revenues, Operating Expenses, Financing Expenses, Investing Expenses
          printWindow.document.write(renderSection('Revenues', incomeStatement.revenues));
          printWindow.document.write(renderSection('Operating Expenses', incomeStatement.operatingExpenses));
          printWindow.document.write(renderSection('Financing Expenses', incomeStatement.financingExpenses));
          printWindow.document.write(renderSection('Investing Expenses', incomeStatement.investingExpenses));
          
          // Totals and net income
          printWindow.document.write('<div class="totals">');
          printWindow.document.write(`Total Revenue: ${formatCurrency(incomeStatement.totalRevenue)}<br>`);
          printWindow.document.write(`Total Operating Expenses: ${formatCurrency(incomeStatement.totalOperatingExpenses)}<br>`);
          printWindow.document.write(`Total Financing Expenses: ${formatCurrency(incomeStatement.totalFinancingExpenses)}<br>`);
          printWindow.document.write(`Total Investing Expenses: ${formatCurrency(incomeStatement.totalInvestingExpenses)}<br>`);
          printWindow.document.write(`Net Income: ${formatCurrency(incomeStatement.netIncome)}<br>`);
          printWindow.document.write(`<strong>Net Income After Tax: ${formatCurrency(incomeStatement.netIncomeAfterTax)}</strong>`);
          printWindow.document.write('</div>');
          
          // Footer with Approved by section
          printWindow.document.write('<div class="footer">');
          printWindow.document.write('<div class="approved">Approved By: ___________________</div>');
          printWindow.document.write('<div class="signature">Signature over Printed Name</div>');
          printWindow.document.write('</div>');
          
          printWindow.document.write('</div>');
          
          // Finalize the document for printing
          printWindow.document.write('</body></html>');
          
          printWindow.document.close();
          setTimeout(() => {
              printWindow.print();
          }, 500);
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
