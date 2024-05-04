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
import { getCounts } from "../utils/backend";


export default function Dashboard() {
    const [counts, setCounts] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

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

    // Fetch counts with debounce to avoid too many requests
    const fetchCounts = useCallback(
        debounce(() => {
            setLoading(true); // Set loading to true before making the request
            getCounts(setError, setCounts)
                .finally(() => {
                    setLoading(false);
                });
        }, 500),
        [getCounts]
    );

    useEffect(() => {
        fetchCounts();
    }, []);

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
            }}
        >
            <Toolbar />
            <Container maxWidth="lg" className='dashboardContainer'>
                <Grid container spacing={3} >
                    {/* Earnings */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Earnings</Typography>
                                <Typography>
                                    <EarningsIcon className='earningsIcon' />
                                    {loading ? <CircularProgress size={15} /> : counts.earningsCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    {/* Expenditures */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Expenditures</Typography>
                                <Typography>
                                    <ExpendituresIcon className='expendituresIcon' />
                                    {loading ? <CircularProgress size={15} /> : counts.expendituresCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    {/* Payable */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Payable</Typography>
                                <Typography>
                                    <PayableIcon className='payableIcon' />
                                    {loading ? <CircularProgress size={15} /> : counts.payableCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    {/* Receivable */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Receivable</Typography>
                                <Typography>
                                    <ReceivableIcon className='receivableIcon' />
                                    {loading ? <CircularProgress size={15} /> : counts.receivableCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    {/* Operating */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Operating</Typography>
                                <Typography>
                                    <OperatingIcon className='operatingIcon' />
                                    {loading ? <CircularProgress size={15} /> : counts.operatingCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Investing */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Investing</Typography>
                                <Typography>
                                    <InvestingIcon className='investingIcon' />
                                    {loading ? <CircularProgress size={15} /> : counts.investingCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Financing */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Financing</Typography>
                                <Typography>
                                    <FinancingIcon className='financingIcon' />
                                    {loading ? <CircularProgress size={15} /> : counts.financingCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    {/* Transaction Type */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <div style={{ display: 'flex' }}>
                                    <TransactionTypeIcon className='transactionTypeIcon' />
                                    <Typography variant="h6">Transaction Type</Typography>
                                </div>
                                <Divider />
                                <Grid container spacing={1} sx={{ mt: 1 }}>
                                    <Grid item xs={6}>
                                        <Typography><span className='boldText'>Cash In:</span></Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography>
                                            {loading ? <CircularProgress size={15} /> : counts.transactionTypes && counts.transactionTypes.cashIn}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={1} sx={{ mt: 1 }}>
                                    <Grid item xs={6}>
                                        <Typography><span className='boldText'>Cash Out:</span></Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography>
                                            {loading ? <CircularProgress size={15} /> : counts.transactionTypes && counts.transactionTypes.cashOut}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                {/* Repeat similar structure for other transaction types */}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <div className='paymentHeader'>
                                    <PaymentIcon className='paymentIcon' />
                                    <Typography variant="h6"> Payment Method</Typography>
                                </div>
                                <Divider />
                                <Grid container spacing={1} sx={{ mt: 1 }}>
                                    <Grid item xs={6}>
                                        <Typography><span className='boldText'>Cash:</span></Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography>{loading ? <CircularProgress size={15} /> : counts.paymentMethods && counts.paymentMethods.cash} </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography><span className='boldText'>Credit Card:</span></Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography>{loading ? <CircularProgress size={15} /> : counts.paymentMethods && counts.paymentMethods.creditCard} </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography><span className='boldText'>Debit Card:</span></Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography>{loading ? <CircularProgress size={15} /> : counts.paymentMethods && counts.paymentMethods.debitCard} </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography><span className='boldText'>Check:</span></Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography>{loading ? <CircularProgress size={15} /> : counts.paymentMethods && counts.paymentMethods.check} </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography><span className='boldText'>Online:</span></Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography>{loading ? <CircularProgress size={15} /> : counts.paymentMethods && counts.paymentMethods.online} </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box >
    );
}