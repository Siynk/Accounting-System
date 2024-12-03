import { useCallback, useEffect, useState } from "react";
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { Container, Grid, Card, CardContent, Typography, Divider, CircularProgress } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Money';
import TransactionTypeIcon from '@mui/icons-material/CompareArrows';
import EarningsIcon from '@mui/icons-material/TrendingUp';
import ExpendituresIcon from '@mui/icons-material/TrendingDown';
import PayableIcon from '@mui/icons-material/Receipt';
import ReceivableIcon from '@mui/icons-material/Payment';
import OperatingIcon from '@mui/icons-material/Store';
import InvestingIcon from '@mui/icons-material/TrendingUp';
import FinancingIcon from '@mui/icons-material/MoneyOff';
import '../css/dashboard.css';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from 'recharts';
import { getCounts, generateBalanceSheet, generateCashflowStatement, generateIncomeStatement, generateSegmentReport, generateTrendAnalysisReport } from "../utils/backend";
import { useStateContext } from "../context/ContextProvider";


export default function Dashboard() {
    const [counts, setCounts] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [balanceSheet, setBalanceSheet] = useState({});
    const [cashflowStatement, setCashflowStatement] = useState({});
    const [segmentReport, setSegmentReport] = useState([]);
    const [trendAnalysisReport, setTrendAnalysisReport] = useState([]);
    const [incomeStatement, setIncomeStatement] = useState({});
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const { user } = useStateContext();
    const [companyName, setCompanyName] = useState('');
    const [rangeType, setRangeType] = useState('week');
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [week, setWeek] = useState('');

    function formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure 2-digit month
      const day = String(date.getDate()).padStart(2, '0'); // Ensure 2-digit day
      return `${year}-${month}-${day}`;
    }

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
      const payload = { companyName: '', rangeType, ...dateRange };

      setLoading(true);
        generateTrendAnalysisReport(setError, setTrendAnalysisReport, payload)
            .finally(() => setLoading(false));
  };

  const handleRangeTypeChange = (e) => {
      setRangeType(e.target.value);
  };

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
    // Set the initial date range on component mount
    useEffect(() => {
        const currentDate = new Date();
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1); // January 1st of the current year

        // Format dates as YYYY-MM-DD without converting to UTC
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        setDateFrom(formatDate(startOfYear));
        setDateTo(formatDate(currentDate));
    }, []);


    useEffect(() => {
        if (user && user.userType === 'client') {
            setCompanyName(user.company);
        }
    }, [user]);
    // Debounce function to prevent too many requests
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
    
    const getRandomColor = () => {
      const colors = [
        '#e3f2fd', // Light Blue
        '#ffe0b2', // Light Orange
        '#c8e6c9', // Light Green
        '#d1c4e9', // Light Purple
        '#ffccbc', // Light Red
        '#f8bbd0', // Light Pink
        '#ffecb3', // Light Yellow
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const combinedTotalProjects = counts.projects && counts.projects.reduce((total, project) => total + (project.transactionCount || 0), 0);
    

    // Fetch counts with debounce to avoid too many requests
    const fetchCounts = useCallback(
        debounce(() => {
            setLoading(true);
            getCounts(setError, setCounts, companyName) // Pass the companyName here
                .finally(() => {
                    setLoading(false);
                });
        }, 500),
        [companyName] // Make sure to add companyName to dependencies
    );

    useEffect(() => {
        const params = {
            companyName,
            dateFrom,
            dateTo,
        };

        // Fetch all reports when companyName, dateFrom, or dateTo change
        const fetchReports = async () => {
            try {
                await Promise.all([
                    generateBalanceSheet(setError, setBalanceSheet, params),
                    generateCashflowStatement(setError, setCashflowStatement, params),
                    generateIncomeStatement(setError, setIncomeStatement, params),
                    generateSegmentReport(setError, setSegmentReport, params),
                ]);
            } catch (err) {
                setError(err);
            }
        };

        if (companyName || dateFrom || dateTo) {
            fetchReports();
        }
    }, [companyName, dateFrom, dateTo]);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);


    // Graph Data Preparation
    const balanceSheetData = [
        { name: 'Assets', value: balanceSheet.totalAssets },
        { name: 'Liabilities', value: balanceSheet.totalLiabilities },
        { name: 'Owner’s Equity', value: balanceSheet.ownerEquity },
    ];

    const cashFlowData = [
        { name: 'Operating', value: cashflowStatement.operatingNetCashflow },
        { name: 'Investing', value: cashflowStatement.investingNetCashflow },
        { name: 'Financing', value: cashflowStatement.financingNetCashflow },
    ];

    const incomeStatementData = [
        { name: 'Total Revenue', value: incomeStatement.totalRevenue },
        { name: 'Net Income', value: incomeStatement.netIncome },
    ];

    const segmentData = segmentReport.map(segment => ({
        name: segment.productLine,
        revenue: segment.totalRevenue,
        expenses: segment.totalExpenses,
    }));

    const trendData = trendAnalysisReport.map(trend => ({
        month: trend.month,
        revenue: trend.totalRevenue,
        expenses: trend.totalExpense,
    }));

    

    // Total values for percentage calculations
    const totalCounts = {
        earnings: counts.earnings || 0,
        expenditures: counts.expenditures || 0,
        operating: counts.operating || 0,
        investing: counts.investing || 0,
        financing: counts.financing || 0,
    };

    const combinedTotal = totalCounts.earnings + totalCounts.expenditures + totalCounts.operating + totalCounts.investing + totalCounts.financing;

    // Function to calculate percentage
    const calculatePercentage = (value, total) => {
        return total > 0 ? ((value / total) * 100).toFixed(2) : 0;
    };


    return user.userType !== 'client' ? (
        <>
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
                }}
            >
                <Toolbar />
                <Container maxWidth="xl" className='dashboardContainer'>
                    <Grid container spacing={3} >
                        {/* Earnings */}
                        <Grid item xs={12} sm={6}>
                            <Card sx={{ background: 'linear-gradient(45deg, #A5D6A7, #66bb6a)', padding: '16px', borderRadius: '8px' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h6" color="white">Earnings</Typography>
                                            <Typography color="textSecondary">
                                                {loading ? <CircularProgress size={15} /> : counts.earnings}
                                            </Typography>
                                        </Box>
                                        <Box position="relative" display="inline-flex">
                                            <CircularProgress variant="determinate" value={calculatePercentage(counts.earnings, combinedTotal)} size={60} />
                                            <Box
                                                position="absolute"
                                                top="50%"
                                                left="50%"
                                                sx={{
                                                    transform: 'translate(-50%, -50%)',
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                }}
                                            >
                                                {loading ? <CircularProgress size={15} /> : `${calculatePercentage(counts.earnings, combinedTotal)}%`}
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Expenditures */}
                        <Grid item xs={12} sm={6}>
                            <Card sx={{ background: 'linear-gradient(45deg, #FFB74D, #FF7043)', padding: '16px', borderRadius: '8px' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h6" color="white">Expenditures</Typography>
                                            <Typography color="textSecondary">
                                                {loading ? <CircularProgress size={15} /> : counts.expenditures}
                                            </Typography>
                                        </Box>
                                        <Box position="relative" display="inline-flex">
                                            <CircularProgress variant="determinate" value={calculatePercentage(counts.expenditures, combinedTotal)} size={60} />
                                            <Box
                                                position="absolute"
                                                top="50%"
                                                left="50%"
                                                sx={{
                                                    transform: 'translate(-50%, -50%)',
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                }}
                                            >
                                                {loading ? <CircularProgress size={15} /> : `${calculatePercentage(counts.expenditures, combinedTotal)}%`}
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Operating */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Card sx={{ background: 'linear-gradient(45deg, #81C784, #66bb6a)', padding: '16px', borderRadius: '8px' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h6" color="white">Operating</Typography>
                                            <Typography color="textSecondary">
                                                {loading ? <CircularProgress size={15} /> : counts.operating}
                                            </Typography>
                                        </Box>
                                        <Box position="relative" display="inline-flex">
                                            <CircularProgress variant="determinate" value={calculatePercentage(counts.operating, combinedTotal)} size={60} />
                                            <Box
                                                position="absolute"
                                                top="50%"
                                                left="50%"
                                                sx={{
                                                    transform: 'translate(-50%, -50%)',
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                }}
                                            >
                                                {loading ? <CircularProgress size={15} /> : `${calculatePercentage(counts.operating, combinedTotal)}%`}
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Investing */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Card sx={{ background: 'linear-gradient(45deg, #D1C4E9, #9575CD)', padding: '16px', borderRadius: '8px' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h6" color="white">Investing</Typography>
                                            <Typography color="textSecondary">
                                                {loading ? <CircularProgress size={15} /> : counts.investing}
                                            </Typography>
                                        </Box>
                                        <Box position="relative" display="inline-flex">
                                            <CircularProgress variant="determinate" value={calculatePercentage(counts.investing, combinedTotal)} size={60} />
                                            <Box
                                                position="absolute"
                                                top="50%"
                                                left="50%"
                                                sx={{
                                                    transform: 'translate(-50%, -50%)',
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                }}
                                            >
                                                {loading ? <CircularProgress size={15} /> : `${calculatePercentage(counts.investing, combinedTotal)}%`}
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Financing */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Card sx={{ background: 'linear-gradient(45deg, #FFCCBC, #FF7043)', padding: '16px', borderRadius: '8px' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h6" color="white">Financing</Typography>
                                            <Typography color="textSecondary">
                                                {loading ? <CircularProgress size={15} /> : counts.financing}
                                            </Typography>
                                        </Box>
                                        <Box position="relative" display="inline-flex">
                                            <CircularProgress variant="determinate" value={calculatePercentage(counts.financing, combinedTotal)} size={60} />
                                            <Box
                                                position="absolute"
                                                top="50%"
                                                left="50%"
                                                sx={{
                                                    transform: 'translate(-50%, -50%)',
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                }}
                                            >
                                                {loading ? <CircularProgress size={15} /> : `${calculatePercentage(counts.financing, combinedTotal)}%`}
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Total Revenue */}
                        <Grid item xs={12} sm={6}>
                            <Card sx={{ background: 'linear-gradient(45deg, #B2DFDB, #80CBC4)', padding: '16px', borderRadius: '8px' }}>
                                <CardContent>
                                    <Typography variant="h6" color="white">Total Revenue</Typography>
                                    <Typography color="textSecondary">
                                        {loading ? <CircularProgress size={15} /> : `₱${parseFloat(incomeStatement.totalRevenue).toLocaleString()}`}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Net Income */}
                        <Grid item xs={12} sm={6}>
                            <Card sx={{ background: 'linear-gradient(45deg, #F1E0B1, #FFB74D)', padding: '16px', borderRadius: '8px' }}>
                                <CardContent>
                                    <Typography variant="h6" color="white">Net Income</Typography>
                                    <Typography color="textSecondary">
                                        {loading ? <CircularProgress size={15} /> : `₱${parseFloat(incomeStatement.netIncome).toLocaleString()}`}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>



                        {/* KPI Section */}
                        {/* <Grid item xs={12}> */}
                            {/* <Typography variant="h5" color="primary" sx={{ textAlign: 'center', marginBottom: '16px' }}>
                                Key Performance Indicators (KPIs)
                            </Typography> */}
                            {/* <Grid container spacing={2} justifyContent="center"> */}
                                {/* Gross Profit Margin */}
                                {/* <Grid item xs={12} sm={6} md={4}>
                                    <Card sx={{ padding: '16px', borderRadius: '8px', backgroundColor: '#1976d2', boxShadow: 3 }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>Gross Profit Margin</Typography>
                                            <Typography color="white" sx={{ fontSize: '1.2rem' }}>
                                                {loading ? <CircularProgress size={15} /> : `${((incomeStatement.totalRevenue - incomeStatement.totalOperatingExpenses) / incomeStatement.totalRevenue * 100).toFixed(2)}%`}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid> */}
                                {/* Operating Margin */}
                                {/* <Grid item xs={12} sm={6} md={4}>
                                    <Card sx={{ padding: '16px', borderRadius: '8px', backgroundColor: '#ff9800', boxShadow: 3 }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>Operating Margin</Typography>
                                            <Typography color="white" sx={{ fontSize: '1.2rem' }}>
                                                {loading ? <CircularProgress size={15} /> : `${((incomeStatement.netIncome / incomeStatement.totalRevenue) * 100).toFixed(2)}%`}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid> */}
                                {/* Return on Equity (ROE) */}
                                {/* <Grid item xs={12} sm={6} md={4}>
                                    <Card sx={{ padding: '16px', borderRadius: '8px', backgroundColor: '#6a1b9a', boxShadow: 3 }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>Return on Equity (ROE)</Typography>
                                            <Typography color="white" sx={{ fontSize: '1.2rem' }}>
                                                {loading ? <CircularProgress size={15} /> : `${((incomeStatement.netIncome / balanceSheet.ownerEquity) * 100).toFixed(2)}%`}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid> */}
                            {/* </Grid>
                        </Grid> */}

                        {/* Balance Sheet Chart */}
                        <Grid item xs={12} sm={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Balance Sheet</Typography>
                                    {loading ? <CircularProgress size={50} /> : (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie data={balanceSheetData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                                    {balanceSheetData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend formatter={(value) => `${value}: ${balanceSheetData.find(item => item.name === value)?.value}`} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Cash Flow Chart */}
                        <Grid item xs={12} sm={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Cash Flow Statement</Typography>
                                    {loading ? <CircularProgress size={50} /> : (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={cashFlowData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="value" fill="#82ca9d" name="Net Cash Flow" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Income Statement Chart */}
                        <Grid item xs={12} sm={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Income Statement</Typography>
                                    {loading ? <CircularProgress size={50} /> : (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={incomeStatementData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="value" stroke="#ff7300" name="Total Revenue & Net Income" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Segment Report Chart */}
                        <Grid item xs={12} sm={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Segment Report</Typography>
                                    {loading ? <CircularProgress size={50} /> : (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={segmentData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                                                <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Trend Analysis Chart */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Trend Analysis</Typography>
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
                  </div>
                </div>
                                    {loading ? <CircularProgress size={50} /> : (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={trendData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="revenue" stroke="#ff7300" name="Monthly Revenue" />
                                                <Line type="monotone" dataKey="expenses" stroke="#82ca9d" name="Monthly Expenses" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                    </Grid>
                </Container>
            </Box >
        </>
    ) : (
      <><Toolbar />
        <Container maxWidth="lg" className='dashboardContainer' sx={{marginTop:10}}>
          <Box
              component="main"
              sx={{
                  backgroundColor: (theme) =>
                      theme.palette.mode === 'light'
                          ? theme.palette.grey[100]
                          : theme.palette.grey[900],
                  flexGrow: 1,
                  height: 'auto',
                  overflow: 'auto',
              }}
          >
              <Grid container spacing={3}>
                  {/* Check if there are projects */}
                  {counts.projects && counts.projects.length > 0 ? (
                      counts.projects.map((project) => {
                          // Extract values for the current project
                          const { projectName, transactionCount } = project;
                          
                          // Get a random background color for the card
                          const cardColor = getRandomColor();

                          return (
                              <Grid item xs={12} sm={6} md={4} key={project.projectName}>
                                  <Card sx={{ backgroundColor: cardColor, padding: '16px', borderRadius: '8px' }}>
                                      <CardContent>
                                          <Box display="flex" justifyContent="space-between" alignItems="center">
                                              <Box>
                                                  <Typography variant="h6">{projectName}</Typography>
                                                  <Typography color="textSecondary">
                                                      {loading ? <CircularProgress size={15} /> : transactionCount}
                                                  </Typography>
                                              </Box>
                                              <Box position="relative" display="inline-flex">
                                                  <CircularProgress
                                                      variant="determinate"
                                                      value={calculatePercentage(transactionCount, combinedTotalProjects)}
                                                      size={60}
                                                  />
                                                  <Box
                                                      position="absolute"
                                                      top="50%"
                                                      left="50%"
                                                      sx={{
                                                          transform: 'translate(-50%, -50%)',
                                                          fontWeight: 'bold',
                                                      }}
                                                  >
                                                      {loading ? <CircularProgress size={15} /> : `${Math.round(calculatePercentage(transactionCount, combinedTotalProjects))}%`}
                                                  </Box>
                                              </Box>
                                          </Box>
                                      </CardContent>
                                  </Card>
                              </Grid>
                          );
                      })
                  ) : (
                      <Grid item xs={12}>
                          <Typography variant="h6" color="textSecondary" align="center">
                              No Projects Available
                          </Typography>
                      </Grid>
                  )}
              </Grid>
          </Box>
      </Container></>

    );
}