import React, { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Container, Table, TableBody, TableCell, TableHead, TableRow, Typography, Button, Select, MenuItem, InputLabel, FormControl, Grid } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { useStateContext } from '../context/ContextProvider';
import { generateTrendAnalysisReport } from '../utils/backend';
import '../css/reports.css';
import { dark } from '@mui/material/styles/createPalette';

const TrendAnalysisReports = () => {
    const [searchText, setSearchText] = useState('');
    const [error, setError] = useState(null);
    const [trendAnalysisReport, setTrendAnalysisReport] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rangeType, setRangeType] = useState('week');
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [week, setWeek] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const { user } = useStateContext();

    function formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure 2-digit month
      const day = String(date.getDate()).padStart(2, '0'); // Ensure 2-digit day
      return `${year}-${month}-${day}`;
    }

    useEffect(() => {
        if (user && user.userType === 'client') {
            setSearchText(user.company);
        }
    }, [user]);

    const handleGenerateTrendAnalysisReport = () => {
        let dateRange = { dateFrom: '', dateTo: '' };
    
        if (rangeType === 'week') {
            // Calculate date range for selected week
            if (year && week) {
                dateRange = getWeekDateRange(year, week);
            }
        } else if (rangeType === 'month') {
            // Calculate date range for selected month
            if (year && month !== '') {
                dateRange = getMonthDateRange(year, month);
            }
        } else if (rangeType === 'year') {
            // Calculate date range for selected year
            if (year) {
                dateRange = getYearDateRange(year);
            }
        }
        
        // Now use the date range in the payload for report generation
        const payload = { companyName: searchText, rangeType, ...dateRange };
        fetchReport(payload);
    };

    const handleRangeTypeChange = (e) => {
        setRangeType(e.target.value);
    };

    const handlePrint = () => {
        const printContent = document.getElementById('printable-area');
        const win = window.open('', '', 'height=500,width=800');
        win.document.write('<html><head><title>Trend Analysis Report</title>');
        win.document.write('<link rel="stylesheet" href="../css/reports.css">');
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
        console.log(payload)
        generateTrendAnalysisReport(setError, setTrendAnalysisReport, payload)
            .finally(() => setLoading(false));
    }, 500), []);

    // Helper function to get the first and last day of the selected week
const getWeekDateRange = (year, week) => {
  const startDate = new Date(year, 0, (week - 1) * 7 + 1); // Get the start of the week
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // Get the end of the week (7 days later)

  return {
      dateFrom: formatDate(startDate), // Format: YYYY-MM-DD
      dateTo: formatDate(endDate) // Format: YYYY-MM-DD
  };
};

// Helper function to get the first and last day of the selected month
function getMonthDateRange(year, month) {
  if (month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12");
  }
  const dateFrom = new Date(year, month - 1, 1);
  const dateTo = new Date(year, month, 0);
  return {
    dateFrom: formatDate(dateFrom),
    dateTo: formatDate(dateTo)
  };
}

// Helper function to get the first and last day of the selected year
const getYearDateRange = (year) => {
  const startDate = new Date(year, 0, 1); // First day of the year
  const endDate = new Date(year, 11, 31); // Last day of the year

  return {
      dateFrom: formatDate(startDate),
      dateTo: formatDate(endDate)
  };
};

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = ['Select Year']; // Add the "Select Year" as the first option
  for (let i = currentYear; i >= currentYear - 10; i--) {
      years.push(i);
  }
  return years;
};


const generateWeekOptions = () => {
    const weeks = ['Select Week'];
    const totalWeeks = 52;
    for (let i = 1; i <= totalWeeks; i++) {
        weeks.push(i);
    }
    return weeks;
};


    return (
      <Box component="main" sx={{ backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900], flexGrow: 1, height: '100vh', overflow: 'auto', margin: 'auto' }}>
            <Container maxWidth="xl" sx={{ marginTop: '80px' }}>
                <Typography variant="h5" component="h2" align="center" sx={{ marginTop: '20px' }}>
                    Trend Analysis Report
                </Typography>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '20px',
                    marginTop: '20px',
                    animation: 'fadeIn 1s ease-out',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                    <div style={{ marginRight: '15px', minWidth: 120, display: 'flex', alignItems: 'center' }}>
                      <label style={{ marginRight: '10px' }}>Range Type</label>
                      <select
                        value={rangeType}
                        onChange={handleRangeTypeChange}
                        style={{
                          width: '160px',
                          padding: '12px 20px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          backgroundColor: '#f4f4f4',
                          height: '45px',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => (e.target.style.borderColor = '#66bb6a')}
                        onMouseLeave={(e) => (e.target.style.borderColor = '#ddd')}
                      >
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                      </select>
                    </div>

                    {rangeType === 'week' && (
                      <>
                        <div style={{ marginRight: '15px', minWidth: 120, display: 'flex', alignItems: 'center' }}>
                          <label style={{ marginRight: '10px' }}>Week</label>
                          <select
                            value={week}
                            onChange={(e) => setWeek(e.target.value)}
                            style={{
                              width: '160px',
                              padding: '12px 20px',
                              fontSize: '14px',
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              backgroundColor: '#f4f4f4',
                              height: '45px',
                              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => (e.target.style.borderColor = '#66bb6a')}
                            onMouseLeave={(e) => (e.target.style.borderColor = '#ddd')}
                          >
                            {generateWeekOptions().map((weekOption) => (
                              <option key={weekOption} value={weekOption}>
                                {weekOption}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ marginRight: '15px', minWidth: 120, display: 'flex', alignItems: 'center' }}>
                          <label style={{ marginRight: '10px' }}>Year</label>
                          <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            style={{
                              width: '160px',
                              padding: '12px 20px',
                              fontSize: '14px',
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              backgroundColor: '#f4f4f4',
                              height: '45px',
                              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => (e.target.style.borderColor = '#66bb6a')}
                            onMouseLeave={(e) => (e.target.style.borderColor = '#ddd')}
                          >
                            {generateYearOptions().map((yearOption) => (
                              <option key={yearOption} value={yearOption}>
                                {yearOption}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {rangeType === 'month' && (
                      <>
                        <div style={{ marginRight: '15px', minWidth: 120, display: 'flex', alignItems: 'center' }}>
                          <label style={{ marginRight: '10px' }}>Month</label>
                          <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            style={{
                              width: '160px',
                              padding: '12px 20px',
                              fontSize: '14px',
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              backgroundColor: '#f4f4f4',
                              height: '45px',
                              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => (e.target.style.borderColor = '#66bb6a')}
                            onMouseLeave={(e) => (e.target.style.borderColor = '#ddd')}
                          >
                            {[
                              'January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'
                            ].map((monthName, index) => (
                              <option key={index} value={index+1}>
                                {monthName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ marginRight: '15px', minWidth: 120, display: 'flex', alignItems: 'center' }}>
                          <label style={{ marginRight: '10px' }}>Year</label>
                          <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            style={{
                              width: '160px',
                              padding: '12px 20px',
                              fontSize: '14px',
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              backgroundColor: '#f4f4f4',
                              height: '45px',
                              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => (e.target.style.borderColor = '#66bb6a')}
                            onMouseLeave={(e) => (e.target.style.borderColor = '#ddd')}
                          >
                            {generateYearOptions().map((yearOption) => (
                              <option key={yearOption} value={yearOption}>
                                {yearOption}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {rangeType === 'year' && (
                      <div style={{ marginRight: '15px', minWidth: 120, display: 'flex', alignItems: 'center' }}>
                        <label style={{ marginRight: '10px' }}>Year</label>
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          style={{
                            width: '160px',
                            padding: '12px 20px',
                            fontSize: '14px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            backgroundColor: '#f4f4f4',
                            height: '45px',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => (e.target.style.borderColor = '#66bb6a')}
                          onMouseLeave={(e) => (e.target.style.borderColor = '#ddd')}
                        >
                          {generateYearOptions().map((yearOption) => (
                            <option key={yearOption} value={yearOption}>
                              {yearOption}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                      style={{
                        background: 'linear-gradient(45deg, #4caf50, #66bb6a)', // Lighter green gradient
                        color: 'white',
                        padding: '12px 25px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: 'none',
                        height: '45px',
                        cursor: 'pointer',
                        marginRight: '15px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => (e.target.style.background = 'linear-gradient(45deg, #66bb6a, #81c784)')}
                      onMouseLeave={(e) => (e.target.style.background = 'linear-gradient(45deg, #4caf50, #66bb6a)')}
                      onClick={(e) => {e.target.style.transform = 'scale(0.98)'; handleGenerateTrendAnalysisReport()}}
                      onAnimationEnd={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      Generate Report
                    </button>

                    <button
                      style={{
                        background: 'linear-gradient(45deg, #388e3c, #2c6e28)', // Darker green gradient
                        color: 'white',
                        padding: '12px 25px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: 'none',
                        height: '45px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => (e.target.style.background = 'linear-gradient(45deg, #2c6e28, #388e3c)')}
                      onMouseLeave={(e) => (e.target.style.background = 'linear-gradient(45deg, #388e3c, #2c6e28)')}
                      onClick={(e) => {e.target.style.transform = 'scale(0.98)'; handlePrint()}}
                      onAnimationEnd={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      Print
                    </button>
                  </div>
                </div>






                <div id="printable-area">
                    <Table className="trendAnalysis-user-table" aria-label="simple table" sx={{ marginTop: '20px' }}>
                        <TableHead>
                            <TableRow>
                                
                                <TableCell>PERIOD</TableCell>
                                <TableCell>TOTAL REVENUE</TableCell>
                                <TableCell>TOTAL EXPENSE</TableCell>
                                <TableCell>PROFIT</TableCell>
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
                                    trendAnalysisReport.map((report, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{report.period}</TableCell>
                                            <TableCell>₱{parseFloat(report.totalRevenue).toLocaleString()}</TableCell>
                                            <TableCell>₱{parseFloat(report.totalExpense).toLocaleString()}</TableCell>
                                            <TableCell>₱{parseFloat(report.profit).toLocaleString()}</TableCell>
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
