import React, { useCallback, useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import '../css/reports.css';
import { generateCashflowStatement } from '../utils/backend';
import { useStateContext } from '../context/ContextProvider';
import '@fortawesome/fontawesome-free/css/all.min.css';


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
        const printWindow = window.open('', '', 'height=600,width=800');
        
        // Check if the printWindow was opened successfully
        if (printWindow) {
            printWindow.document.write('<html><head><title>Balance Sheet</title>');
            printWindow.document.write('<style>body { font-family: Arial, sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(document.querySelector('.cashflowStatement-content').innerHTML);
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
            <Container maxWidth="md" className="cashflowStatement-container">
    <div className="cashflowStatement-header">
        <h1>Generate Cashflow Statement</h1>
        <div className="cashflowStatement-inputs">
            {(user.userType === 'admin' || user.userType === 'superadmin') && (
                <input
                    type="text"
                    placeholder="Enter Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="cashflowStatement-input"
                />
            )}
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
