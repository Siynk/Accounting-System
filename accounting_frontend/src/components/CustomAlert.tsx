// src/components/CustomAlert.js
import React from 'react';
import '../css/customAlert.scss'; // Make sure to change this to .scss

const CustomAlert = ({ message, onClose, onOk, show }) => {
    return (
        <div className={`custom-alert-container ${show ? 'fade-in' : 'fade-out'}`}>
            <div className="custom-alert">
                <button className="custom-alert-close-button" onClick={onClose}>
                    &times;
                </button>
                <div className="custom-alert-message">{message}</div>
                <button className="custom-alert-ok-button" onClick={onOk}>
                    OK
                </button>
            </div>
        </div>
    );
};

export default CustomAlert;
