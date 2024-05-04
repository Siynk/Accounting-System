import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import '../css/addUser.css';
import { addUser } from '../utils/backend';

const AddUser = () => {
    let [error, setError] = useState(null);


    const handleSubmit = (event) => {
        event.preventDefault();
        let data = new FormData(event.currentTarget);
        let payload = {
            name: data.get("name"),
            username: data.get("username"),
            password: data.get("password"),
            address: data.get("address"),
            email: data.get("email"),
            contact: data.get("contact"),
        }
        console.log(data);
        addUser(payload, setError, event);

    };

    return (
        <Box
            component="main"
            sx={{
                backgroundColor: '#f5f5f5', // Light grey background
                flexGrow: 1,
                height: '100vh',
                overflow: 'auto',
                padding: '24px', // Add padding for spacing
            }}
        >
            <Toolbar />
            <Container maxWidth="lg">
                <Grid container spacing={3} justifyContent="flex-start">
                    <Grid item xs={12} sm={12}>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                            <TableContainer component={Paper} className='addUserTable' >
                                <Table aria-label="personal information table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell colSpan={2} >
                                                <div className='submitButtonAndErrorContainer'>
                                                    <div className='submitButtonContainer"'>
                                                        <Button type='submit' style={{ backgroundColor: "#858a8f", color: "white" }} className="submitButton">Submit</Button>
                                                    </div>

                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        <TableRow>
                                            <TableCell><strong>Name:</strong></TableCell>
                                            <TableCell>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    id="name"
                                                    name="name"
                                                    autoComplete="name"
                                                    autoFocus
                                                />
                                                {error && error.name && error.name.map((errorMessage, index) => (
                                                    <Typography key={index} ><span className='addUserErrorText'>{errorMessage}</span></Typography>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>Username:</strong></TableCell>
                                            <TableCell>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    id="username"
                                                    name="username"
                                                    autoComplete="username"
                                                />
                                                {error && error.username && error.username.map((errorMessage, index) => (
                                                    <Typography key={index} ><span className='addUserErrorText'>{errorMessage}</span></Typography>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>Password:</strong></TableCell>
                                            <TableCell>
                                                <input
                                                    type="password"
                                                    className="input"
                                                    id="password"
                                                    name="password"
                                                    autoComplete="password"
                                                />
                                                {error && error.password && error.password.map((errorMessage, index) => (
                                                    <Typography key={index} ><span className='addUserErrorText'>{errorMessage}</span></Typography>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>Address:</strong></TableCell>

                                            <TableCell>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    id="address"
                                                    name="address"
                                                    autoComplete="address"
                                                />
                                                {error && error.address && error.address.map((errorMessage, index) => (
                                                    <Typography key={index} ><span className='addUserErrorText'>{errorMessage}</span></Typography>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>Email:</strong></TableCell>

                                            <TableCell>
                                                <input
                                                    type="email"
                                                    className="input"
                                                    id="email"
                                                    name="email"
                                                    autoComplete="email"
                                                />
                                                {error && error.email && error.email.map((errorMessage, index) => (
                                                    <Typography key={index}><span className='addUserErrorText'>{errorMessage}</span></Typography>
                                                ))}
                                            </TableCell>

                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>Contact:</strong></TableCell>
                                            <TableCell>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    id="contact"
                                                    name="contact"
                                                    autoComplete="contact"
                                                />
                                                {error && error.contact && error.contact.map((errorMessage, index) => (
                                                    <Typography key={index} ><span className='addUserErrorText'>{errorMessage}</span></Typography>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>

                                </Table>
                            </TableContainer>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box >
    );
}

export default AddUser;
