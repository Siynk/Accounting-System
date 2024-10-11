import React, { useState } from 'react';
import { Container } from '@mui/material';
import '../css/forgotPassword.scss';
import Email from '@mui/icons-material/Email';
import { sendForgotPasswordEmail } from '../utils/backend';
import CustomAlert from '../components/CustomAlert';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResponseMessage('');

        const params = { email };
        const result = await sendForgotPasswordEmail(setError, setResponseMessage, params);

        if (result.error) {
            setError(result.error);
            setResponseMessage('');
        } else {
            setResponseMessage(result.message);
            setError('');
        }

        setShowAlert(true); // Show the alert after submission
    };

    const handleCloseAlert = () => {
        setShowAlert(false); // Close the alert
    };

    const handleOk = () => {
        setShowAlert(false); // Also close the alert
    };

    return (
        <Container maxWidth="md">
            <div className="form_wrapper-forgot">
                <div className="form_container-forgot">
                    <div className="title_container-forgot">
                        <h2>Forgot Password</h2>
                    </div>
                    <div className="row_forgot clearfix-forgot">
                        <div>
                            <form onSubmit={handleSubmit}>
                                <div className="input_field-forgot">
                                    <span className='forgot-icon'><Email /></span>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <input className="button-forgot" type="submit" value="Send Email" />
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {showAlert && (
                <CustomAlert
                    message={responseMessage || error}
                    onClose={handleCloseAlert}
                    onOk={handleOk}
                    show={showAlert} // Pass the show prop to control animation
                />
            )}
        </Container>
    );
};

export default ForgotPassword;
