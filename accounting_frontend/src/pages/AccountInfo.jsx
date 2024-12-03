import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Paper from '@mui/material/Paper';
import '../css/accountinfo.css';
import { useStateContext } from '../context/ContextProvider';
import { getLoggedInUser, updateUser } from '../utils/backend';

const AccountInfo = () => {
  let { user, setUser, } = useStateContext();

  React.useEffect(() => {
    getLoggedInUser(setUser);
  }, []);

  const [isEdit, setIsEdit] = useState(false);
  let [error, setError] = useState(null);

  const handleEdit = () => {
    setIsEdit(true);
  };


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
      id: user.id,
      confirm_password: data.get('cpass')
    }

    updateUser(payload, setError, setIsEdit);
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
      <Container maxWidth="xl">
        <Grid container spacing={3} justifyContent="flex-start">
          <Grid item xs={12} sm={12}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TableContainer component={Paper} className='accountInfoTable'>
                <Table aria-label="personal information table">
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={2} >
                        {isEdit ? (
                          <div className='submitButtonAndErrorContainer'>
                            <div className='submitButtonContainer"'>
                              <Button type='submit' style={{ backgroundColor: "#858a8f", color: "white" }} className="submitButton">Submit</Button>
                            </div>

                          </div>
                        ) : (
                          <EditIcon variant="contained" className="editButton" onClick={handleEdit} />
                        )}
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Name:</strong></TableCell>
                      {isEdit ? (
                        <TableCell>
                          <input
                            type="text"
                            className="input"
                            id="name"
                            name="name"
                            defaultValue={user.name}
                            autoComplete="name"
                            autoFocus
                          />
                          {error && error.name && error.name.map((errorMessage, index) => (
                            <Typography key={index} ><span className='updateUserErrorText'>{errorMessage}</span></Typography>
                          ))}
                        </TableCell>

                      ) : (
                        <TableCell>{user.name}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Username:</strong></TableCell>
                      {isEdit ? (
                        <TableCell>
                          <input
                            type="text"
                            className="input"
                            id="username"
                            name="username"
                            defaultValue={user.username}
                            autoComplete="username"
                          />
                          {error && error.username && error.username.map((errorMessage, index) => (
                            <Typography key={index} ><span className='updateUserErrorText'>{errorMessage}</span></Typography>
                          ))}
                        </TableCell>
                      ) : (
                        <TableCell>{user.username}</TableCell>
                      )}
                    </TableRow>
                    {isEdit &&
                      (<TableRow>
                        <TableCell><strong>Password:</strong></TableCell>
                        <TableCell>
                          <input
                            type="text"
                            className="input"
                            id="password"
                            name="password"
                            autoComplete="password"
                          />
                          {error && error.password && error.password.map((errorMessage, index) => (
                            <Typography key={index} ><span className='updateUserErrorText'>{errorMessage}</span></Typography>
                          ))}
                        </TableCell>
                      </TableRow>)}
                    {isEdit &&
                      (<TableRow>
                        <TableCell><strong>Confirm Password:</strong></TableCell>
                        <TableCell>
                          <input
                            type="text"
                            className="input"
                            id="cpass"
                            name="cpass"
                            autoComplete="confirm_password"
                          />
                          {error && error.confirm_password && error.confirm_password.map((errorMessage, index) => (
                            <Typography key={index} ><span className='updateUserErrorText'>{errorMessage}</span></Typography>
                          ))}
                        </TableCell>
                      </TableRow>)}
                    <TableRow>
                      <TableCell><strong>Address:</strong></TableCell>
                      {isEdit ? (
                        <TableCell>
                          <input
                            type="text"
                            className="input"
                            id="address"
                            name="address"
                            defaultValue={user.address}
                            autoComplete="address"
                          />
                          {error && error.address && error.address.map((errorMessage, index) => (
                            <Typography key={index} ><span className='updateUserErrorText'>{errorMessage}</span></Typography>
                          ))}
                        </TableCell>
                      ) : (
                        <TableCell>{user.address}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Email:</strong></TableCell>
                      {isEdit ? (
                        <TableCell>
                          <input
                            type="email"
                            className="input"
                            id="email"
                            name="email"
                            defaultValue={user.email}
                            autoComplete="email"
                          />
                          {error && error.email && error.email.map((errorMessage, index) => (
                            <Typography key={index} ><span className='updateUserErrorText'>{errorMessage}</span></Typography>
                          ))}
                        </TableCell>
                      ) : (
                        <TableCell>{user.email}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Contact:</strong></TableCell>
                      {isEdit ? (
                        <TableCell>
                          <input
                            type="text"
                            className="input"
                            id="contact"
                            name="contact"
                            defaultValue={user.contact}
                            autoComplete="contact"
                          />
                          {error && error.contact && error.contact.map((errorMessage, index) => (
                            <Typography key={index} ><span className='updateUserErrorText'>{errorMessage}</span></Typography>
                          ))}
                        </TableCell>
                      ) : (
                        <TableCell>{user.contact}</TableCell>
                      )}
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

export default AccountInfo;
