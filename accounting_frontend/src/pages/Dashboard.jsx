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
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Earnings</Typography>
                                    <Typography>
                                        <EarningsIcon className='earningsIcon' />
                                        {loading ? <CircularProgress size={15} /> : counts.earnings}
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
                                        {loading ? <CircularProgress size={15} /> : counts.expenditures}
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
                                        {loading ? <CircularProgress size={15} /> : counts.operating}
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
                                        {loading ? <CircularProgress size={15} /> : counts.investing}
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
                                        {loading ? <CircularProgress size={15} /> : counts.financing}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                    </Grid>
                </Container>
            </Box >
        </>
    );
}