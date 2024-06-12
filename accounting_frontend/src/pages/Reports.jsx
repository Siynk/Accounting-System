import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import '../css/reports.css';

const Reports = () => {
    const [searchText, setSearchText] = useState('');
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
            <Container maxWidth="md" style={{ marginTop: '80px' }}>
                <div className="search-container-report">
                    <input
                        type="text"
                        id="search-field"
                        placeholder="Search Client"
                        className="filter"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <span className='client-search-result'>asd</span>
                    <span className='generate-report-button-container'><button >Generate</button></span>
                </div>
            </Container>
        </Box>

    );
};

export default Reports;
