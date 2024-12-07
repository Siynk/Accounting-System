import React, { useState } from 'react';
import { Container, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../css/registration.scss';
import Username from '@mui/icons-material/Person';
import Password from '@mui/icons-material/Lock';
import Email from '@mui/icons-material/Email';
import Address from '@mui/icons-material/Home';
import Contact from '@mui/icons-material/Phone';
import Company from '@mui/icons-material/Business';
import Name from '@mui/icons-material/AccountCircle';
import { registerClient } from '../utils/backend';

const Register = () => {
    const navigate = useNavigate(); // Initialize useNavigate
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        email: '',
        address: '',
        contact: '',
        company: '',
    });
    const [error, setErrors] = useState({});
    const [confirmError, setConfirmError] = useState('');
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setConfirmError('Passwords do not match');
            return;
        }

        const payload = {
            ...formData,
            userType: 'client'
        };

        await registerClient(payload, setErrors, e, navigate);
        
        
    };

    return (
        <Container maxWidth="md">
            <div className="form_wrapper-register">
                <div className="form_container-register">
                    <div className="title_container-register">
                        <h2>Client Registration</h2>
                    </div>
                    <Button variant="outlined" onClick={() => navigate(-1)} style={{ marginBottom: '20px', background: '#8da58f', color: 'white' }}>
                        Back
                    </Button>
                    <div className="row_register clearfix-register">
                        <div>
                            <form onSubmit={handleSubmit}>
                                <div className="input_field-register">
                                    <span className='register-icon'><Name /></span>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                    {error && error.name && error.name.map((errorMessage, index) => (
                                        <Typography key={index}><span className="registerErrorColor">{errorMessage}</span></Typography>
                                    ))}
                                </div>
                                <div className="input_field-register">
                                    <span className='register-icon'><Username /></span>
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                    {error && error.username && error.username.map((errorMessage, index) => (
                                        <Typography key={index}><span className="registerErrorColor">{errorMessage}</span></Typography>
                                    ))}
                                </div>
                                <div className="input_field-register">
                                    <span className='register-icon'><Password /></span>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    {error && error.password && error.password.map((errorMessage, index) => (
                                        <Typography key={index}><span className="registerErrorColor">{errorMessage}</span></Typography>
                                    ))}
                                </div>
                                <div className="input_field-register">
                                    <span className='register-icon'><Password /></span>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    {confirmError && <p className="registerErrorColor">{confirmError}</p>}
                                </div>
                                <div className="input_field-register">
                                    <span className='register-icon'><Email /></span>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    {error && error.email && error.email.map((errorMessage, index) => (
                                        <Typography key={index}><span className="registerErrorColor">{errorMessage}</span></Typography>
                                    ))}
                                </div>
                                <div className="input_field-register">
                                    <span className='register-icon'><Address /></span>
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                    />
                                    {error && error.address && error.address.map((errorMessage, index) => (
                                        <Typography key={index}><span className="registerErrorColor">{errorMessage}</span></Typography>
                                    ))}
                                </div>
                                <div className="input_field-register">
                                    <span className='register-icon'><Contact /></span>
                                    <input
                                        type="text"
                                        name="contact"
                                        placeholder="Contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        required
                                    />
                                    {error && error.contact && error.contact.map((errorMessage, index) => (
                                        <Typography key={index}><span className="registerErrorColor">{errorMessage}</span></Typography>
                                    ))}
                                </div>
                                <div className="input_field-register">
                                    <span className='register-icon'><Company /></span>
                                    <input
                                        type="text"
                                        name="company"
                                        placeholder="Company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        required
                                    />
                                    {error && error.company && error.company.map((errorMessage, index) => (
                                        <Typography key={index}><span className="registerErrorColor">{errorMessage}</span></Typography>
                                    ))}
                                </div>
                                <input className="button-register" type="submit" value="Register" />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default Register;
