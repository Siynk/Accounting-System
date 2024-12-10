import React, { useCallback, useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import '../css/reports.css';
import { generateCashflowStatement } from '../utils/backend';
import { useStateContext } from '../context/ContextProvider';
import '@fortawesome/fontawesome-free/css/all.min.css';
import logo from '../assets/logo-removebg-preview.png';


const CashflowStatement = () => {
    const [cashflowStatement, setCashflowStatement] = useState({});
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
    console.log(cashflowStatement)
    const handleGenerate = useCallback(() => {
        const params = {
            companyName,
            dateFrom,
            dateTo
        };
        console.log(params);
        generateCashflowStatement(setError, setCashflowStatement, params);
    }, [companyName, dateFrom, dateTo]);

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
    
      // Prepare the HTML for printing
      const printWindow = window.open('', '', 'height=600,width=800');
    
      printWindow.document.write('<html><head><title>Cashflow Statement</title>');
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
          max-width: 800px; /* Limit the content width */
          margin: 0 auto; /* Center the content */
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
          font-size: 20;
          font-weight: bold;
          margin: 0;
        }
        .activity-section {
          margin-bottom: 5px;
          width: 100%;
          padding: 10px 0;
          border-bottom: 1px solid #ddd;
        }
        .activity-title {
          font-weight: bold;
          margin-bottom: 10px;
          font-size: 14;
          color: #333;
        }
        .activity-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .section-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 12px;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .activity-item .description {
          flex: 3; /* Make description area wider */
          padding-right: 10px;
          font-size: 10px;
          color: #555;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .activity-item .amount,
        .activity-item .cashFlow,
        .activity-item .transactionDate {
          width: 120px;
          text-align: right;
          font-size: 10px;
          color: #555;
        }
        .section-header .description {
            flex: 3;
            padding-right: 10px;
            font-size: 12px;
            color: #555;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .section-header .amount,
        .section-header .date {
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
          padding-bottom: 15px; /* Added padding-bottom for extra spacing */
        }

        .totals div {
          margin-bottom: 10px; /* Added margin-bottom to space out the individual total items */
        }
        .footer {
          margin-top: 40px;
          text-align: left;
          font-size: 12px;
        }
        .footer .signature-line {
            width: 350px;
            border-bottom: 1px solid #000;
            text-align: center;
            padding-bottom: 2px;
            margin-top:30px;
        }
        .footer .signature-text {
            text-align: left;
            margin-top: 10px; /* Increased space between signature line and text */
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
      printWindow.document.write('<div class="title">Cashflow Statement</div>');
      printWindow.document.write(`<img src="${logo}" alt="Logo">`);
      printWindow.document.write('</div>');
    
      // Render the activity sections (Operating, Investing, Financing)
      const renderActivitySection = (title, activities) => {
        let sectionHtml = `<div class="activity-section"><div class="activity-title">${title}</div>`;

        sectionHtml += `
                  <div class="section-header">
                      <div class="description">Description</div>
                      <div class="amount">Amount</div>
                      <div class="date">Date</div>
                  </div>
              `;
        
        activities.forEach(activity => {
          const formattedDate = new Date(activity.transactionDate).toLocaleDateString();
          sectionHtml += `
            <div class="activity-item">
              <div class="description">${activity.description}</div>
              <div class="amount">${formatCurrency(activity.amount)}</div>
              <div class="cashFlow">${activity.cashFlow}</div>
              <div class="transactionDate">${formattedDate}</div>
            </div>
          `;
        });
        
        sectionHtml += '</div>';
        return sectionHtml;
      };
    
      // Render the operating activities section
      printWindow.document.write(renderActivitySection('Operating Activities', cashflowStatement.operatingActivities));
    
      // Render the investing activities section
      printWindow.document.write(renderActivitySection('Investing Activities', cashflowStatement.investingActivities));
    
      // Render the financing activities section
      printWindow.document.write(renderActivitySection('Financing Activities', cashflowStatement.financingActivities));
    
      // Totals and net cashflow display
      printWindow.document.write('<div class="totals">');
      printWindow.document.write(`
          <div style="margin-bottom: 10px;">Operating Net Cashflow: ${formatCurrency(cashflowStatement.operatingNetCashflow)}</div>
          <div style="margin-bottom: 10px;">Investing Net Cashflow: ${formatCurrency(cashflowStatement.investingNetCashflow)}</div>
          <div style="margin-bottom: 10px;">Financing Net Cashflow: ${formatCurrency(cashflowStatement.financingNetCashflow)}</div>
          <div style="font-weight: bold; margin-bottom: 20px;">Total Net Cashflow: ${formatCurrency(cashflowStatement.totalNetCashflow)}</div>
      `);
      printWindow.document.write('</div>');
    
      // Footer with Approved by section
      printWindow.document.write('<div class="footer">');
      printWindow.document.write(`
          <div>Approved By:</div>
          <div class="signature-line"></div>
          <div class="signature-text">Signature over Printed Name</div>
      </div>
      </div>`);
    
      printWindow.document.write('</div>');
    
      // Finalize the document for printing
      printWindow.document.write('</body></html>');
    
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
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
            <Container maxWidth="xl" className="cashflowStatement-container">
    <div className="cashflowStatement-header">
        <h1>Generate Cashflow Statement</h1>
        <div className="cashflowStatement-inputs">
            {/* {(user.userType === 'admin' || user.userType === 'superadmin') && (
                <input
                    type="text"
                    placeholder="Enter Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="cashflowStatement-input"
                />
            )} */}
            <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="cashflowStatement-input"
            />
            <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="cashflowStatement-input"
            />
            <button onClick={handleGenerate} className="cashflowStatement-button">
                Generate
            </button>
            <button className="cashflowStatement-button print-button" onClick={handlePrint}>
                Print
            </button>
        </div>
    </div>
    <div className="cashflowStatement-content">
        <h2 className="cashflowStatement-title">Cashflow Statement</h2>
        <table className="cashflowStatement-table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Amount (₱)</th>
                </tr>
            </thead>
            <tbody>
                {/* Operating Activities */}
                <tr className="cashflowStatement-subheader-operatingActivities">
                    <td colSpan={2}>
                        <i className="icon-operating-activities" aria-hidden="true"></i>
                        Operating Activities
                    </td>
                </tr>
                {cashflowStatement.operatingActivities && cashflowStatement.operatingActivities.length > 0 ? (
                    cashflowStatement.operatingActivities.map((operatingActivity, index) => (
                        <tr key={index} className="cashflowStatement-operatingActivity">
                            <td>{operatingActivity.description}</td>
                            <td style={{ color: operatingActivity.transactionType === 'Expense' || operatingActivity.transactionType === 'Liabilities' || operatingActivity.transactionType === 'Purchase' ? 'red' : 'black' }}>
                                ₱{parseFloat(operatingActivity.amount).toLocaleString()}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="2">No Record</td>
                    </tr>
                )}
                <tr className="cashflowStatement-subheader-operatingActivitiesInflows">
                    <td>
                        <i className="icon-operating-inflows" aria-hidden="true"></i>
                        <b>Operating Activities Inflows</b>
                    </td>
                </tr>
                {cashflowStatement.operatingIncomeActivities && cashflowStatement.operatingIncomeActivities.length > 0 ? (
                    cashflowStatement.operatingIncomeActivities.map((operatingIncomeActivity, index) => (
                        <tr key={index} className="cashflowStatement-operatingIncomeActivities">
                            <td>{operatingIncomeActivity.description}</td>
                            <td>₱{parseFloat(operatingIncomeActivity.amount).toLocaleString()}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="2">No Record</td>
                    </tr>
                )}
                <tr className="cashflowStatement-total">
                    <td>Total Operating Inflow</td>
                    <td>₱{cashflowStatement.operatingIncome?.toLocaleString() || 0}</td>
                </tr>
                <tr className="cashflowStatement-subheader-operatingActivitiesOutflows">
                    <td>
                        <i className="icon-operating-outflows" aria-hidden="true"></i>
                        <b>Operating Activities Outflows</b>
                    </td>
                </tr>
                {cashflowStatement.operatingExpenseActivities && cashflowStatement.operatingExpenseActivities.length > 0 ? (
                    cashflowStatement.operatingExpenseActivities.map((operatingExpenseActivity, index) => (
                        <tr key={index} className="cashflowStatement-operatingExpenseActivities">
                            <td>{operatingExpenseActivity.description}</td>
                            <td style={{ color: 'red' }}>₱{parseFloat(operatingExpenseActivity.amount).toLocaleString()}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="2">No Record</td>
                    </tr>
                )}
                <tr className="cashflowStatement-total">
                    <td>Total Operating Outflow</td>
                    <td style={{ color: 'red' }}>₱{cashflowStatement.operatingExpenses?.toLocaleString() || 0}</td>
                </tr>
                <tr className="cashflowStatement-total-net">
                    <td>Operating Net Cashflow</td>
                    <td style={{ color: cashflowStatement.operatingNetCashflow < 0 ? 'red' : 'black' }}>₱{cashflowStatement.operatingNetCashflow?.toLocaleString() || 0}</td>
                </tr>

                {/* Investing Activities */}
                <tr className="cashflowStatement-subheader-investingActivities">
                    <td colSpan={2}>
                        <i className="icon-investing-activities" aria-hidden="true"></i>
                        <b>Investing Activities</b>
                    </td>
                </tr>
                {cashflowStatement.investingActivities && cashflowStatement.investingActivities.length > 0 ? (
                    cashflowStatement.investingActivities.map((investingActivity, index) => (
                        <tr key={index} className="cashflowStatement-investingActivity">
                            <td>{investingActivity.description}</td>
                            <td style={{ color: investingActivity.transactionType === 'Expense' || investingActivity.transactionType === 'Liabilities' || investingActivity.transactionType === 'Purchase' ? 'red' : 'black' }}>
                                ₱{parseFloat(investingActivity.amount).toLocaleString()}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="2">No Record</td>
                    </tr>
                )}
                <tr className="cashflowStatement-subheader-investingActivitiesInflows">
                    <td>
                        <i className="icon-investing-inflows" aria-hidden="true"></i>
                        <b>Investing Activities Inflows</b>
                    </td>
                </tr>
                {cashflowStatement.investingIncomeActivities && cashflowStatement.investingIncomeActivities.length > 0 ? (
                    cashflowStatement.investingIncomeActivities.map((investingIncomeActivity, index) => (
                        <tr key={index} className="cashflowStatement-investingIncomeActivities">
                            <td>{investingIncomeActivity.description}</td>
                            <td>₱{parseFloat(investingIncomeActivity.amount).toLocaleString()}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="2">No Record</td>
                    </tr>
                )}
                <tr className="cashflowStatement-total">
                    <td>Total Investing Inflow</td>
                    <td>₱{cashflowStatement.investingIncome?.toLocaleString() || 0}</td>
                </tr>
                <tr className="cashflowStatement-subheader-investingActivitiesOutflows">
                    <td>
                        <i className="icon-investing-outflows" aria-hidden="true"></i>
                        <b>Investing Activities Outflows</b>
                    </td>
                </tr>
                {cashflowStatement.investingExpenseActivities && cashflowStatement.investingExpenseActivities.length > 0 ? (
                    cashflowStatement.investingExpenseActivities.map((investingExpenseActivity, index) => (
                        <tr key={index} className="cashflowStatement-investingExpenseActivities">
                            <td>{investingExpenseActivity.description}</td>
                            <td style={{ color: 'red' }}>₱{parseFloat(investingExpenseActivity.amount).toLocaleString()}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="2">No Record</td>
                    </tr>
                )}
                <tr className="cashflowStatement-total">
                    <td>Total Investing Outflow</td>
                    <td style={{ color: 'red' }}>₱{cashflowStatement.investingExpenses?.toLocaleString() || 0}</td>
                </tr>
                <tr className="cashflowStatement-total-net">
                    <td>Investing Net Cashflow</td>
                    <td style={{ color: cashflowStatement.investingNetCashflow < 0 ? 'red' : 'black' }}>₱{cashflowStatement.investingNetCashflow?.toLocaleString() || 0}</td>
                </tr>

                {/* Financing Activities */}
                <tr className="cashflowStatement-subheader-financingActivities">
                    <td colSpan={2}>
                        <i className="icon-financing-activities" aria-hidden="true"></i>
                        <b>Financing Activities</b>
                    </td>
                </tr>
                {cashflowStatement.financingActivities && cashflowStatement.financingActivities.length > 0 ? (
                    cashflowStatement.financingActivities.map((financingActivity, index) => (
                        <tr key={index} className="cashflowStatement-financingActivity">
                            <td>{financingActivity.description}</td>
                            <td style={{ color: financingActivity.transactionType === 'Expense' || financingActivity.transactionType === 'Liabilities' || financingActivity.transactionType === 'Purchase' ? 'red' : 'black' }}>
                                ₱{parseFloat(financingActivity.amount).toLocaleString()}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="2">No Record</td>
                    </tr>
                )}
                <tr className="cashflowStatement-subheader-financingActivitiesInflows">
                    <td>
                        <i className="icon-financing-inflows" aria-hidden="true"></i>
                        <b>Financing Activities Inflows</b>
                    </td>
                </tr>
                {cashflowStatement.financingIncomeActivities && cashflowStatement.financingIncomeActivities.length > 0 ? (
                    cashflowStatement.financingIncomeActivities.map((financingIncomeActivity, index) => (
                        <tr key={index} className="cashflowStatement-financingIncomeActivities">
                            <td>{financingIncomeActivity.description}</td>
                            <td>₱{parseFloat(financingIncomeActivity.amount).toLocaleString()}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="2">No Record</td>
                    </tr>
                )}
                <tr className="cashflowStatement-total">
                    <td>Total Financing Inflow</td>
                    <td>₱{cashflowStatement.financingIncome?.toLocaleString() || 0}</td>
                </tr>
                <tr className="cashflowStatement-subheader-financingActivitiesOutflows">
                    <td>
                        <i className="icon-financing-outflows" aria-hidden="true"></i>
                        <b>Financing Activities Outflows</b>
                    </td>
                </tr>
                {cashflowStatement.financingExpenseActivities && cashflowStatement.financingExpenseActivities.length > 0 ? (
                    cashflowStatement.financingExpenseActivities.map((financingExpenseActivity, index) => (
                        <tr key={index} className="cashflowStatement-financingExpenseActivities">
                            <td>{financingExpenseActivity.description}</td>
                            <td style={{ color: 'red' }}>₱{parseFloat(financingExpenseActivity.amount).toLocaleString()}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="2">No Record</td>
                    </tr>
                )}
                <tr className="cashflowStatement-total">
                    <td>Total Financing Outflow</td>
                    <td style={{ color: 'red' }}>₱{cashflowStatement.financingExpenses?.toLocaleString() || 0}</td>
                </tr>
                <tr className="cashflowStatement-total-net">
                    <td>Financing Net Cashflow</td>
                    <td style={{ color: cashflowStatement.financingNetCashflow < 0 ? 'red' : 'black' }}>₱{cashflowStatement.financingNetCashflow?.toLocaleString() || 0}</td>
                </tr>
                <tr className="cashflowStatement-total-cashflow">
                    <td>Total Net Cashflow</td>
                    <td style={{ color: cashflowStatement.totalNetCashflow < 0 ? 'red' : 'black' }}>₱{cashflowStatement.totalNetCashflow?.toLocaleString() || 0}</td>
                </tr>
            </tbody>
        </table>
    </div>
</Container>

        </Box>
    );
};

export default CashflowStatement;
