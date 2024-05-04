import React from 'react';
import Box from '@mui/material/Box';
import '../css/footer.css';

function Footer() {
    return (
        <Box
            component="footer"
            className='footer'
        >
            {/* Add your footer content here */}
            <span className='content'>Copyright © {new Date().getFullYear()}</span>
        </Box>
    );
}

export default Footer;
