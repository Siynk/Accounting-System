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
                    generateTrendAnalysisReport(setError, setTrendAnalysisReport, params),
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
    console.log(segmentReport, "@@@@@@@@@@")

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
                <Container maxWidth="lg" className='dashboardContainer'>
                    <Grid container spacing={3} >
                        {/* Earnings */}
                        <Grid item xs={12} sm={6}>
                            <Card sx={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '8px' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h6" color="primary">Earnings</Typography>
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
                            <Card sx={{ backgroundColor: '#ffe0b2', padding: '16px', borderRadius: '8px' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h6" color="secondary">Expenditures</Typography>
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
                            <Card sx={{ backgroundColor: '#c8e6c9', padding: '16px', borderRadius: '8px' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h6" color="success.main">Operating</Typography>
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
                            <Card sx={{ backgroundColor: '#d1c4e9', padding: '16px', borderRadius: '8px' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h6" color="purple">Investing</Typography>
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
                            <Card sx={{ backgroundColor: '#ffccbc', padding: '16px', borderRadius: '8px' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h6" color="error.main">Financing</Typography>
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
                            <Card sx={{ backgroundColor: '#bbdefb', padding: '16px', borderRadius: '8px' }}>
                                <CardContent>
                                    <Typography variant="h6" color="primary">Total Revenue</Typography>
                                    <Typography color="textSecondary">
                                        {loading ? <CircularProgress size={15} /> : `₱${parseFloat(incomeStatement.totalRevenue).toLocaleString()}`}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Net Income */}
                        <Grid item xs={12} sm={6}>
                            <Card sx={{ backgroundColor: '#ffe0b2', padding: '16px', borderRadius: '8px' }}>
                                <CardContent>
                                    <Typography variant="h6" color="secondary">Net Income</Typography>
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