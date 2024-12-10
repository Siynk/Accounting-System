import React, { useCallback, useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import '../css/reports.css';
import { generateSegmentReport } from '../utils/backend';
import { useStateContext } from '../context/ContextProvider';
import appLogo from '../assets/logo-removebg-preview.png';

const SegmentReport = () => {
    const [segmentReport, setSegmentReport] = useState({});
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
        generateSegmentReport(setError, setSegmentReport, params);
    }, [companyName, dateFrom, dateTo]);

    const handlePrint = () => {
      const printWindow = window.open('', '', 'height=800,width=1200');
    
      // Format currency in PHP format
      const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency: 'PHP',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      };
    
      printWindow.document.write('<html><head><title>Segment Report</title><style>');
    
      // Add styles for printing
      printWindow.document.write(`
        body {
          font-family: 'Arial', sans-serif;
          padding: 20px;
          font-size: 12px;
        }
        .report-container {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .header img {
          height: 50px;
          width: auto;
        }
        .header h1 {
          font-size: 18px;
          margin: 0;
          text-align: right;
          flex-grow: 1;
        }
        .data-container {
          margin-top: 20px;
        }
        .data-row {
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
        }
        .data-label {
          width: 40%; /* Increase the width of the segment column */
          font-weight: bold;
          word-wrap: break-word; /* Allow text to wrap */
        }
        .data-value {
          width: 20%; /* Reduce the width of the other columns */
          text-align: right;
        }
        .data-row-header {
          margin-bottom: 12px;
          font-weight: bold;
          font-size: 14px; /* Increase font size of column headers */
        }
        .footer {
          margin-top: 50px; /* Increased space between content and the "Approved By" section */
          font-size: 12px;
          text-align: left;
        }
        .footer .signature-line {
          width: 350px;
          border-bottom: 1px solid #000;
          text-align: center;
          padding-bottom: 2px;
          margin-top: 5px;
        }
        .footer .signature-text {
          text-align: left;
          margin-top: 10px; /* Increased space between signature line and text */
        }
      `);
    
      printWindow.document.write('</style></head><body>');
    
      // Generate the header with the app logo and title
      printWindow.document.write(`
        <div class="report-container">
          <div class="header">
            <img src="${appLogo}" alt="Company Logo">
            <h1>Segment Report</h1>
          </div>
    
          <div class="data-container">
            <div class="data-row data-row-header">
              <div class="data-label">Segment</div>
              <div class="data-value">Total Revenue</div>
              <div class="data-value">Total Expenses</div>
              <div class="data-value">Profit</div>
            </div>
      `);
    
      // Generate the data rows dynamically based on the segmentReport
      segmentReport.forEach(item => {
        printWindow.document.write(`
          <div class="data-row">
            <div class="data-label">${item.productLine}</div>
            <div class="data-value">${formatCurrency(item.totalRevenue)}</div>
            <div class="data-value">${formatCurrency(item.totalExpenses)}</div>
            <div class="data-value">${formatCurrency(item.netIncome)}</div>
          </div>
        `);
      });
    
      printWindow.document.write(`
          </div>
    
          <div class="footer">
            <div>Approved By:</div>
            <div class="signature-line"></div>
            <div class="signature-text">Signature over Printed Name</div>
          </div>
        </div>
      `);
    
      printWindow.document.write('</body></html>');
      printWindow.document.close();
    
      // Wait for the content to load and then print
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
            <Container maxWidth="xl" className="segmentReport-container">
                <div className="segmentReport-header">
                    <h1>Generate Segment Report</h1>
                    <div className="segmentReport-inputs">
                    {/* {user.userType !== 'client' && <input
                            type="text"
                            placeholder="Enter Company Name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="segmentReport-input"
                        />} */}
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="segmentReport-input"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="segmentReport-input"
                        />
                        <button onClick={handleGenerate} className="segmentReport-button">
                            Generate
                        </button>
                        <button className="segmentReport-button print-button" onClick={handlePrint}>
                            Print
                        </button>
                    </div>
                </div>
                <div className="segmentReport-content">
                    <h2 className="segmentReport-title">Segment Report</h2>
                    <table className="segmentReport-table">
                        <thead>
                            <tr>
                                <th>Product Line</th>
                                <th>Total Revenue</th>
                                <th>Total Expenses</th>
                                <th>Net Income</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(segmentReport).map(([productLine, data]) => (
                                <tr key={productLine}>
                                    <td>{data.productLine}</td>
                                    <td>₱{parseFloat(data.totalRevenue).toLocaleString()}</td>
                                    <td>₱{parseFloat(data.totalExpenses).toLocaleString()}</td>
                                    <td>₱{parseFloat(data.netIncome).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Container>
        </Box>
    );
};

export default SegmentReport;
