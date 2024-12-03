import React from 'react';
import { useStateContext } from '../context/ContextProvider';
import { Container, Box, Button } from '@mui/material';
import Print from '@mui/icons-material/Print';

const SingleUser = () => {
    let { viewClient } = useStateContext();
    if (!viewClient) {
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
                <Container maxWidth="xl" className="history-container">
                    <div className="header">
                        <h2>User Details</h2>
                        <Button className='hidebtn' sx={{
                            backgroundColor: "#008000", color: "#ededed", '&:hover': {
                                bgcolor: '#035b03',
                            },
                        }} onClick={handlePrint}>Print <Print /></Button>
                    </div>
                    <div className="balances">
                        <div className="account-balance">
                            <span className="label">Name</span>
                            <span className="dots"></span>
                            <span className="amount">{viewClient.name}</span>
                        </div>
                        <div className="account-balance">
                            <span className="label">Username</span>
                            <span className="dots"></span>
                            <span className="amount">{viewClient.username}</span>
                        </div>
                        <div className="account-balance">
                            <span className="label">User Type</span>
                            <span className="dots"></span>
                            <span className="amount">{viewClient.userType}</span>
                        </div>
                        <div className="account-balance">
                            <span className="label">Address</span>
                            <span className="dots"></span>
                            <span className="amount">{viewClient.address}</span>
                        </div>
                        <div className="account-balance">
                            <span className="label">Email</span>
                            <span className="dots"></span>
                            <span className="amount">{viewClient.email}</span>
                        </div>
                        <div className="account-balance">
                            <span className="label">Contact</span>
                            <span className="dots"></span>
                            <span className="amount">{viewClient.contact}</span>
                        </div>
                        {viewClient.company && <div className="account-balance">
                            <span className="label">Company</span>
                            <span className="dots"></span>
                            <span className="amount">{viewClient.company}</span>
                        </div>}
                    </div>
                </Container>
            </div>
        </Box>
    );
};

export default SingleUser;
