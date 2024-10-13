import React, { useCallback, useEffect, useState } from 'react';
import { Box, CircularProgress, Container, Table, TableBody, TableCell, TableHead, TableRow, Typography, Button } from '@mui/material';
import '../css/reports.css';
import { generateTrendAnalysisReport } from '../utils/backend';
import PrintIcon from '@mui/icons-material/Print';
import { useStateContext } from '../context/ContextProvider';

const TrendAnalysisReports = () => {
    const [searchText, setSearchText] = useState('');
    const [error, setError] = useState(null);
    const [trendAnalysisReport, setTrendAnalysisReport] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useStateContext();

    useEffect(() => {
        if (user && user.userType === 'client') {
            setSearchText(user.company);
        }
    }, [user]);

    const handleGenerateTrendAnalysisReport = () => {
        const payload = searchText;
        console.log(payload)
        fetchReport(payload);
    };

    const handlePrint = () => {
        const printContent = document.getElementById('printable-area');
        const win = window.open('', '', 'height=500,width=800');
        win.document.write('<html><head><title>Trend Analysis Report</title>');
        win.document.write('<link rel="stylesheet" href="../css/reports.css">'); // Adjust path as needed
        win.document.write('</head><body>');
        win.document.write(printContent.innerHTML);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
    };

    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const fetchReport = useCallback(debounce((payload) => {
        setLoading(true);
        generateTrendAnalysisReport(setError, setTrendAnalysisReport, { companyName: payload })
            .finally(() => setLoading(false));
    }, 500), []);

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
                margin: "auto"
            }}
        >
            <Container maxWidth="md" style={{ marginTop: '100px' }}>
                <div className="trendAnalysis-search-container-report">
                    {user.userType !== 'client' && <input
                        type="text"
                        id="search-field"
                        placeholder="Search Client"
                        className="trendAnalysis-filter"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />}
                    <span className='trendAnalysis-generate-report-button-container'>
                        <Button variant="contained" onClick={handleGenerateTrendAnalysisReport}>Generate</Button>
                    </span>
                    <span className='trendAnalysis-print-button-container'>
                        <Button variant="outlined" onClick={handlePrint} startIcon={<PrintIcon />}>Print</Button>
                    </span>
                </div>
                <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ marginTop: '20px' }}>
                    Trend Analysis Report
                </Typography>
                <div id="printable-area">
                    <Table className="trendAnalysis-user-table" aria-label="simple table" sx={{ marginTop: '20px' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell><span className='trendAnalysis-user-header'>YEAR</span></TableCell>
                                <TableCell><span className='trendAnalysis-user-header'>MONTH</span></TableCell>
                                <TableCell><span className='trendAnalysis-user-header'>TOTAL REVENUE</span></TableCell>
                                <TableCell><span className='trendAnalysis-user-header'>TOTAL EXPENSE</span></TableCell>
                                <TableCell><span className='trendAnalysis-user-header'>PROFIT</span></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center"><CircularProgress /></TableCell>
                                </TableRow>
                            ) : (
                                trendAnalysisReport.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">No Records Found</TableCell>
                                    </TableRow>
                                ) : (
                                    trendAnalysisReport.map((user, index) => (
                                        <TableRow key={index}>
                                            <TableCell><span className='trendAnalysis-user-content'>{user.year}</span></TableCell>
                                            <TableCell><span className='trendAnalysis-user-content'>{user.month}</span></TableCell>
                                            <TableCell><span className='trendAnalysis-user-content'>₱{parseFloat(user.totalRevenue).toLocaleString()}</span></TableCell>
                                            <TableCell><span className='trendAnalysis-user-content'>₱{parseFloat(user.totalExpense).toLocaleString()}</span></TableCell>
                                            <TableCell><span className='trendAnalysis-user-content'>₱{parseFloat(user.profit).toLocaleString()}</span></TableCell>
                                        </TableRow>
                                    ))
                                )
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Container>
        </Box>
    );
};

export default TrendAnalysisReports;
