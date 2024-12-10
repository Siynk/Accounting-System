import { useCallback, useEffect, useState } from "react";
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { Container, Grid, Card, CardContent, Typography, Divider, CircularProgress, Button } from '@mui/material';
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
    ComposedChart,
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from 'recharts';
import { getCounts, generateBalanceSheet, generateCashflowStatement, generateIncomeStatement, generateSegmentReport, generateTrendAnalysisReport } from "../utils/backend";
import { useStateContext } from "../context/ContextProvider";
import appLogo from '../assets/logo-removebg-preview.png';


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
    const [normalizedBalanceSheet, setNormalizedBalanceSheet] = useState({});

    

    const handleGenerateTrendAnalysisReport = () => {
      
      
      // Now use the date range in the payload for report generation
      const payload = { companyName: '', rangeType, month:month, year:year };

      setLoading(true);
        generateTrendAnalysisReport(setError, setTrendAnalysisReport, payload)
            .finally(() => setLoading(false));
  };


  const handleRangeTypeChange = (e) => {
      setRangeType(e.target.value);
  };

  
  
  console.log(trendAnalysisReport)
  
  // Helper function to get the first and last day of the selected year
 
  
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = ['Select Year']; // Add the "Select Year" as the first option
    for (let i = currentYear; i >= currentYear - 10; i--) {
        years.push(i);
    }
    return years;
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
    
    const getMonthName = (monthNumber) => {
      const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
      ];
      return months[monthNumber - 1]; // monthNumber is 1-indexed
  };

    const trendData = trendAnalysisReport.map((report) => {
      let periodLabel = '';

        // Label the period properly based on the range type
        if (report.week) {
            periodLabel = `Week ${report.week}`;
        } else if (report.month) {
            periodLabel = getMonthName(report.month); // Convert numeric month to month name
        } else if (report.year) {
            periodLabel = `Year ${report.year}`;
        }

        return {
            period: periodLabel,
            totalRevenue: parseFloat(report.totalRevenue),
            totalExpense: parseFloat(report.totalExpense),
            profit: parseFloat(report.profit)
        };
  });

  useEffect(() => {
    if(balanceSheet.assets){
      const updatedAssets = balanceSheet.assets.filter(asset => asset.amount !== "0");

    // Update the balance sheet with the filtered assets
    setNormalizedBalanceSheet(prevState => ({
      ...prevState,
      assets: updatedAssets,
    }));
    }
  }, [balanceSheet]);

    

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

    const handlePrint = (chart) => {
      if(chart === 'segmentReportChart'){
        handlePrintSegmentReport(segmentReport);
      }
      if(chart === 'balanceSheetChart'){
        handlePrintBalanceSheet();
      }
      if(chart === 'cashFlowChart'){
        handlePrintCashflow();
      }
      if(chart === 'incomeStatementChart'){
        handlePrintIncomeStatement();
      }
  };

    const handlePrintTrendAnalysisReport = () => {
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
    
      // Convert month number to month name
      const getMonthName = (monthNumber) => {
        const months = [
          "January", "February", "March", "April", "May", "June", 
          "July", "August", "September", "October", "November", "December"
        ];
        return months[monthNumber - 1]; // Adjust for zero-based index
      };
    
      printWindow.document.write('<html><head><title>Trend Analysis Report</title><style>');
    
      // Add styles for printing
      printWindow.document.write(`
        body {
          font-family: 'Arial', sans-serif;
          padding: 20px;
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
          font-size: 24px;
          margin: 0;
          text-align: right;
          flex-grow: 1;
        }
        .table-container {
          margin-top: 20px;
          width: 100%;
          border-collapse: collapse;
        }
        .table-container th, .table-container td {
          border: 1px solid #000;
          padding: 10px;
          text-align: center;
        }
        .table-container th {
          background-color: #f0f0f0;
        }
        .footer {
          position: absolute;
          bottom: 20px;
          right: 30px;
          text-align: right;
          font-size: 14px;
        }
        .footer .signature {
          margin-top: 10px;
          border-top: 1px solid #000;
          width: 200px;
          text-align: center;
          padding-top: 5px;
        }
      `);
    
      printWindow.document.write('</style></head><body>');
    
      // Generate the header with the app logo and title
      printWindow.document.write(`
        <div class="report-container">
          <div class="header">
            <img src="${appLogo}" alt="Company Logo">
            <h1>Trend Analysis Report</h1>
          </div>
          
          <table class="table-container">
            <thead>
              <tr>
                <th>Period</th>
                <th>Total Revenue</th>
                <th>Total Expense</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
      `);
    
      // Generate the table rows dynamically based on the trendAnalysisReport data
      trendAnalysisReport.forEach(item => {
        const period = item.month ? getMonthName(item.month) : item.week ? `Week ${item.week}` : item.year;
    
        printWindow.document.write(`
          <tr>
            <td>${period}</td>
            <td>${formatCurrency(item.totalRevenue)}</td>
            <td>${formatCurrency(item.totalExpense)}</td>
            <td>${formatCurrency(item.profit)}</td>
          </tr>
        `);
      });
    
      printWindow.document.write(`
            </tbody>
          </table>
    
          <div class="footer">
            <div>Approved By: _______________________</div>
            <div class="signature">Signature over printed name</div>
          </div>
        </div>
      `);
    
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };

    const handlePrintSegmentReport = (segmentReportData) => {
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
          font-size: 24px;
          margin: 0;
          text-align: right;
          flex-grow: 1;
        }
        .table-container {
          margin-top: 20px;
          width: 100%;
          border-collapse: collapse;
        }
        .table-container th, .table-container td {
          border: 1px solid #000;
          padding: 10px;
          text-align: center;
        }
        .table-container th {
          background-color: #f0f0f0;
        }
        .footer {
          position: absolute;
          bottom: 20px;
          right: 30px;
          text-align: right;
          font-size: 14px;
        }
        .footer .signature {
          margin-top: 10px;
          border-top: 1px solid #000;
          width: 200px;
          text-align: center;
          padding-top: 5px;
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
    
          <table class="table-container">
            <thead>
              <tr>
                <th>Segment</th>
                <th>Total Revenue</th>
                <th>Total Expenses</th>
                <th>Net Income (Profit)</th>
              </tr>
            </thead>
            <tbody>
      `);
    
      // Generate the table rows dynamically based on the segmentReportData
      segmentReportData.forEach(item => {
        printWindow.document.write(`
          <tr>
            <td>${item.productLine}</td>
            <td>${formatCurrency(item.totalRevenue)}</td>
            <td>${formatCurrency(item.totalExpenses)}</td>
            <td>${formatCurrency(item.netIncome)}</td>
          </tr>
        `);
      });
    
      printWindow.document.write(`
            </tbody>
          </table>
    
          <div class="footer">
            <div>Approved By: _______________________</div>
            <div class="signature">Signature over printed name</div>
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
    
    const handlePrintBalanceSheet = () => {
      const printWindow = window.open('', '', 'height=600,width=800');
  
      // Check if the printWindow was opened successfully
      if (printWindow) {
          printWindow.document.write('<html><head><title>Balance Sheet</title>');
          
          // Styling for the print layout
          printWindow.document.write(`
              <style>
                  body { 
                      font-family: Arial, sans-serif; 
                      margin: 0; 
                      padding: 20px; 
                      line-height: 1.6; 
                  }
                  .balanceSheet-container { 
                      width: 100%; 
                      max-width: 800px; 
                      margin: 0 auto; 
                  }
                  .balanceSheet-header { 
                      text-align: center; 
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      margin-bottom: 20px; 
                  }
                  .balanceSheet-title { 
                      font-size: 24px; 
                      font-weight: bold; 
                      margin: 0;
                      text-align: left;
                      flex-grow: 1;
                  }
                  .balanceSheet-logo { 
                      width: 80px; 
                      height: auto; 
                      margin-left: 20px;
                  }
                  .balanceSheet-section { 
                      margin-bottom: 10px; 
                  }
                  .balanceSheet-section-title { 
                      font-size: 18px; 
                      font-weight: bold; 
                      margin-bottom: 5px; 
                      text-transform: uppercase;
                  }
                  .balanceSheet-item { 
                      margin-bottom: 5px; 
                      display: flex; 
                      justify-content: space-between;
                      align-items: center;
                  }
                  .balanceSheet-item-date { 
                      font-size: 12px; 
                      color: #555; 
                      margin-left: 10px;
                  }
                  .balanceSheet-item-description { 
                      font-size: 16px; 
                      font-weight: normal;
                      flex-grow: 1;
                  }
                  .balanceSheet-item-amount { 
                      font-size: 16px; 
                      font-weight: normal; 
                      text-align: right;
                      min-width: 120px;
                  }
                  .balanceSheet-total { 
                      font-weight: bold; 
                      font-size: 18px; 
                      margin-top: 10px; 
                      display: flex;
                      justify-content: flex-end; /* Align totals to the right */
                      text-align: right; /* Ensure text is aligned right */
                  }
                  .balanceSheet-check { 
                      font-weight: bold; 
                      font-size: 16px; 
                      display: flex;
                      justify-content: space-between;
                      margin-top: 15px;
                  }
                  .balanceSheet-check-true { 
                      color: green; 
                  }
                  .balanceSheet-check-false { 
                      color: red; 
                  }
                  .approved-section {
                      position: absolute;
                      bottom: 20px;
                      right: 20px;
                      font-size: 12px;
                      text-align: right;
                      font-style: italic;
                  }
              </style>
          `);
  
          printWindow.document.write('</head><body>');
          
          // Add the logo and title side by side
          printWindow.document.write('<div class="balanceSheet-header">');
          printWindow.document.write(`<h1 class="balanceSheet-title">Balance Sheet</h1>`);
          printWindow.document.write(`<img src="${appLogo}" class="balanceSheet-logo" />`);
          printWindow.document.write('</div>');
          
          // Company name and formatted date range
          printWindow.document.write('<p><strong>Company Name:</strong> ' + companyName + '</p>');
          
          // Format the date range (e.g., "December 10, 2024")
          const formatDate = (dateStr) => {
              const date = new Date(dateStr);
              const options = { year: 'numeric', month: 'long', day: 'numeric' };
              return date.toLocaleDateString('en-US', options); // Format: Month Day, Year
          };
          
          printWindow.document.write('<p><strong>Date Range:</strong> ' + formatDate(dateFrom) + ' to ' + formatDate(dateTo) + '</p>');
  
          // Assets Section
          printWindow.document.write('<div class="balanceSheet-section">');
          printWindow.document.write('<div class="balanceSheet-section-title">Assets</div>');
          if (normalizedBalanceSheet.assets && normalizedBalanceSheet.assets.length > 0) {
              normalizedBalanceSheet.assets.forEach(asset => {
                  printWindow.document.write('<div class="balanceSheet-item">');
                  printWindow.document.write('<div class="balanceSheet-item-description">' + asset.description + (asset.transactionType === 'Receivable' ? ' (Accounts Receivable)' : '') + '</div>');
                  printWindow.document.write('<div class="balanceSheet-item-amount">₱' + parseFloat(asset.amount).toLocaleString() + '</div>');
                  printWindow.document.write('<div class="balanceSheet-item-date">' + formatDate(asset.date) + '</div>');
                  printWindow.document.write('</div>');
              });
          } else {
              printWindow.document.write('<div>No assets to display</div>');
          }
          printWindow.document.write('<div class="balanceSheet-total">Total Assets: ₱' + (balanceSheet.totalAssets?.toLocaleString() || 0) + '</div>');
          printWindow.document.write('</div>');
  
          // Liabilities Section
          printWindow.document.write('<div class="balanceSheet-section">');
          printWindow.document.write('<div class="balanceSheet-section-title">Liabilities</div>');
          if (balanceSheet.liabilities && balanceSheet.liabilities.length > 0) {
              balanceSheet.liabilities.forEach(liability => {
                  printWindow.document.write('<div class="balanceSheet-item">');
                  printWindow.document.write('<div class="balanceSheet-item-description">' + liability.description + '</div>');
                  printWindow.document.write('<div class="balanceSheet-item-amount">₱' + parseFloat(liability.amount).toLocaleString() + '</div>');
                  printWindow.document.write('<div class="balanceSheet-item-date">' + formatDate(liability.date) + '</div>');
                  printWindow.document.write('</div>');
              });
          } else {
              printWindow.document.write('<div>No liabilities to display</div>');
          }
          printWindow.document.write('<div class="balanceSheet-total">Total Liabilities: ₱' + (balanceSheet.totalLiabilities?.toLocaleString() || 0) + '</div>');
          printWindow.document.write('</div>');
  
          // Equity Section
          printWindow.document.write('<div class="balanceSheet-section">');
          printWindow.document.write('<div class="balanceSheet-section-title">Owner\'s Equity</div>');
          printWindow.document.write('<div class="balanceSheet-item">');
          printWindow.document.write('<div class="balanceSheet-item-description">Owner\'s Equity</div>');
          printWindow.document.write('<div class="balanceSheet-item-amount">₱' + (balanceSheet.ownerEquity?.toLocaleString() || 0) + '</div>');
          printWindow.document.write('</div>');
          printWindow.document.write('<div class="balanceSheet-total">Total Liabilities + Total Equity: ₱' + (balanceSheet.totalLiabilitiesPlusTotalEquity?.toLocaleString() || 0) + '</div>');
          printWindow.document.write('</div>');
  
          // Balance Check
          printWindow.document.write('<div class="balanceSheet-check">');
          printWindow.document.write('<div>BALANCE CHECK:</div>');
          printWindow.document.write('<div class="' + (balanceSheet.totalAssets === balanceSheet.totalLiabilitiesPlusTotalEquity ? 'balanceSheet-check-true' : 'balanceSheet-check-false') + '">' +
              (balanceSheet.totalAssets === balanceSheet.totalLiabilitiesPlusTotalEquity ? 'BALANCED' : 'NOT BALANCED') +
              '</div>');
          printWindow.document.write('</div>');
  
          // "Approved by" Section
          printWindow.document.write('<div class="approved-section">');
          printWindow.document.write('<p>Approved by: _______________________</p>');
          printWindow.document.write('<p>Date: _______________________________</p>');
          printWindow.document.write('</div>');
  
          printWindow.document.write('</body></html>');
          printWindow.document.close();
          setTimeout(() => {
              printWindow.print();
          }, 500);
          
      } else {
          console.error('Failed to open print window');
      }
  };

  const handlePrintCashflow = () => {
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
    printWindow.document.write('<div class="title">Cashflow Statement</div>');
    printWindow.document.write(`<img src="${appLogo}" alt="Logo">`);
    printWindow.document.write('</div>');
  
    // Render the activity sections (Operating, Investing, Financing)
    const renderActivitySection = (title, activities) => {
      let sectionHtml = `<div class="activity-section"><div class="activity-title">${title}</div>`;
      
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
    printWindow.document.write(`Operating Net Cashflow: ${formatCurrency(cashflowStatement.operatingNetCashflow)}<br>`);
    printWindow.document.write(`Investing Net Cashflow: ${formatCurrency(cashflowStatement.investingNetCashflow)}<br>`);
    printWindow.document.write(`Financing Net Cashflow: ${formatCurrency(cashflowStatement.financingNetCashflow)}<br>`);
    printWindow.document.write(`<strong>Total Net Cashflow: ${formatCurrency(cashflowStatement.totalNetCashflow)}</strong>`);
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
  };

  const handlePrintIncomeStatement = () => {
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
        printWindow.document.write(`<img src="${appLogo}" alt="Logo">`);
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
                                    <Button onClick={() => handlePrint('balanceSheetChart')} variant="contained" color="primary">
                                        Print Report
                                    </Button>
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
                                    <Button onClick={() => handlePrint('cashFlowChart')} variant="contained" color="primary">
                                        Print Report
                                    </Button>
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
                                    <Button onClick={() => handlePrint('incomeStatementChart')} variant="contained" color="primary">
                                        Print Report
                                    </Button>
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
                                    <Button onClick={() => handlePrint('segmentReportChart')} variant="contained" color="primary">
                                        Print Report
                                    </Button>
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
                      onClick={(e) => {e.target.style.transform = 'scale(0.98)'; handlePrintTrendAnalysisReport()}}
                      onAnimationEnd={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      Print
                    </button>
                  </div>
                </div>
                                    {loading ? <CircularProgress size={50} /> : (
                                        <ResponsiveContainer width="100%" height={400}>
                                        <LineChart data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" name="Period" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                        
                                            <Line type="monotone" name="Revenue" dataKey="totalRevenue" stroke="#82ca9d" activeDot={{ r: 8 }} />
                                            <Line type="monotone" name="Expense" dataKey="totalExpense" stroke="#ff7300" />
                                            <Line type="monotone" name="Profit" dataKey="profit" stroke="#8884d8" />
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