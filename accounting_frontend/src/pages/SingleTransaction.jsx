import React from 'react';
import { useStateContext } from '../context/ContextProvider';
import '../css/singleTransaction.css';
import dayjs from 'dayjs';
import { Container, Box, Button, Typography, Divider } from '@mui/material';
import { formatMoney } from '../utils/helper';
import Print from '@mui/icons-material/Print';

const SingleTransaction = () => {
    let { singleTransaction } = useStateContext();
    if (!singleTransaction) {
        return <div>Loading...</div>;
    }
    console.log(singleTransaction, "@@@@");

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
            <div id="print-content" style={{ fontFamily: 'Arial, sans-serif', width: '80%', margin: '0 auto' }}>
                <Container maxWidth="xl" className="history-container" style={{ padding: '20px', border: '1px solid #ddd' }}>

                    <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Transaction Details</h2>
                        <Button className='hidebtn' sx={{
                            backgroundColor: "#008000", color: "#ededed", '&:hover': {
                                bgcolor: '#035b03',
                            },
                        }} onClick={handlePrint}>
                            Print <Print />
                        </Button>
                    </div>
                    <Divider style={{ margin: '20px 0' }} />
                    <div className="balances" style={{ marginBottom: '20px' }}>
                        {/* Transaction details */}
                        <div className="account-balance" style={{ marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold' }}>Date:</span> <span>{dayjs(singleTransaction.transactionDate).format('MM-DD-YYYY')}</span>
                        </div>
                        <div className="account-balance" style={{ marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold' }}>Type:</span> <span>{singleTransaction.transactionType}</span>
                        </div>
                        <div className="account-balance" style={{ marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold' }}>Description:</span> <span>{singleTransaction.description}</span>
                        </div>
                        <div className="account-balance" style={{ marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold' }}>Product Line:</span> <span>{singleTransaction.productLine}</span>
                        </div>
                        {singleTransaction.company && <div className="account-balance" style={{ marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold' }}>Client:</span> <span>{singleTransaction.company}</span>
                        </div>}
                        {singleTransaction.projectName && <div className="account-balance" style={{ marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold' }}>Project:</span> <span>{singleTransaction.projectName}</span>
                        </div>}
                        <div className="account-balance" style={{ marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold' }}>Transaction Category Category:</span> <span>{singleTransaction.cashFlow}</span>
                        </div>
                        <div className="account-balance" style={{ marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold' }}>Amount:</span> <span>{formatMoney(singleTransaction.amount)}</span>
                        </div>
                    </div>

                    {/* Materials Table */}
                    <Typography variant="h6" style={{ marginTop: '30px', marginBottom: '10px', fontWeight: 'bold' }}>Materials</Typography>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Material Name</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Price</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Quantity</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {singleTransaction.materials && singleTransaction.materials.map((material, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{material.name}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatMoney(material.price)}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{material.quantity}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatMoney(material.price * material.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </Container>
            </div>
        </Box>
    );
};

export default SingleTransaction;
