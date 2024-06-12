import React from 'react';
import { useStateContext } from '../context/ContextProvider';
import '../css/singleTransaction.css';
import dayjs from 'dayjs';
import { Container, Box, Button } from '@mui/material';
import { formatMoney } from '../utils/helper';
import Print from '@mui/icons-material/Print';




const SingleTransaction = () => {
    let { singleTransaction } = useStateContext();
    if (!singleTransaction) {
        return <div>Loading...</div>;
    }
    const handlePrint = () => {
        window.print();
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
                margin: "auto"
            }}
        >
            <div id='print-content'>
                <Container maxWidth="md" className="history-container">

                    <div className="header">
                        <h2>Transaction Details</h2>
                        <Button className='hidebtn' sx={{
                            backgroundColor: "#008000", color: "#ededed", '&:hover': {
                                bgcolor: '#035b03',
                            },
                        }} onClick={handlePrint}>Print <Print /></Button>
                    </div>
                    <div className="balances">
                        <div className="account-balance">
                            <span className="label">Date</span>
                            <span className="dots"></span>
                            <span className="amount">{dayjs(singleTransaction.transactionDate).format('MM-DD-YYYY')}</span>
                        </div>
                        <div className="account-balance">
                            <span className="label">Type</span>
                            <span className="dots"></span>
                            <span className="amount">{singleTransaction.transactionType}</span>
                        </div>
                        <div className="account-balance">
                            <span className="label">Description</span>
                            <span className="dots"></span>
                            <span className="amount">{singleTransaction.description}</span>
                        </div>
                        <div className="account-balance">
                            <span className="label">Product Line</span>
                            <span className="dots"></span>
                            <span className="amount">{singleTransaction.productLine}</span>
                        </div>
                        <div className="account-balance">
                            <span className="label">Client</span>
                            <span className="dots"></span>
                            <span className="amount">{singleTransaction.company}</span>
                        </div>
                        <div className="account-balance">
                            <span className="label">Cash Flow Category</span>
                            <span className="dots"></span>
                            <span className="amount">{singleTransaction.cashFlowCategory}</span>
                        </div>
                        <div className="account-balance">
                            <span className="label">Amount</span>
                            <span className="dots"></span>
                            <span className="amount">{formatMoney(singleTransaction.amount)}</span>
                        </div>
                    </div>

                </Container>
            </div>
        </Box>
    );
};

export default SingleTransaction;
