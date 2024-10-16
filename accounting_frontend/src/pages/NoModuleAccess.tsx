import Box from '@mui/material/Box';
import { Container, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import '../css/noModuleAccess.css';
import { getModules, requestAccess } from "../utils/backend";
import React, { useEffect, useState } from 'react';
import { useStateContext } from '../context/ContextProvider';

export default function NoModuleAccess() {
    const [error, setError] = useState(null);
    const [modules, setModules] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedModules, setSelectedModules] = useState([]);
    const { token, user } = useStateContext();

    useEffect(() => {
        const fetchModules = async () => {
            await getModules(setError, setModules);
        };

        fetchModules();
    }, []);

    const handleCheckboxChange = (moduleId) => {
        setSelectedModules((prev) => 
            prev.includes(moduleId) 
            ? prev.filter(id => id !== moduleId) 
            : [...prev, moduleId]
        );
    };

    const handleRequestAccess = async () => {
        const payload = {
            user_id: user.id,
            modules: selectedModules,
            status: 'Pending', // Assuming a default status
        };
        await requestAccess(payload, setError);
        setOpenDialog(false);
        setSelectedModules([]);
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Container maxWidth="lg" className='noModuleAccessContainer'>
                <Typography variant="h4" className='noAccessText'>
                    You do not have access to this module.
                </Typography>
                {user.userType === 'admin' && (<Button variant="contained" color="primary" className='noModuleRequestAccessButton' onClick={() => setOpenDialog(true)}>
                    Request Access
                </Button>)}
            </Container>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle className='noModuleDialogTitle'>Request Access</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" className='noModuleDialogContent'>
                        Select modules you want to request access to:
                    </Typography>
                    <FormGroup>
                        {modules.map(module => (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedModules.includes(module.id)}
                                        onChange={() => handleCheckboxChange(module.id)}
                                        name={module.description}
                                    />
                                }
                                label={module.description}
                                key={module.id}
                            />
                        ))}
                    </FormGroup>
                    {error && <Typography color="error">{error}</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary" className='noModuleCancelButton'>
                        Cancel
                    </Button>
                    <Button onClick={handleRequestAccess} color="primary" className='noModuleSubmitButton'>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
