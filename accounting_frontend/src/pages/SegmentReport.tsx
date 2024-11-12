import React, { useCallback, useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import '../css/reports.css';
import { generateSegmentReport } from '../utils/backend';
import { useStateContext } from '../context/ContextProvider';

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
        const printWindow = window.open('', '', 'height=600,width=800');
        
        // Check if the printWindow was opened successfully
        if (printWindow) {
            printWindow.document.write('<html><head><title>Segment Report</title>');
            printWindow.document.write('<style>body { font-family: Arial, sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(document.querySelector('.segmentReport-content').innerHTML);
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
            <Container maxWidth="md" className="segmentReport-container">
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
