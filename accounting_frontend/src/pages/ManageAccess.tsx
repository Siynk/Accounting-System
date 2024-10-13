
import React, { useEffect, useState }  from 'react';
import Box from '@mui/material/Box';
import { Container} from '@mui/material';
import { getModules, getAllAdmins, getPendingAccess, updateAccess, addNewAccess, getAccess, approvePendingAccessRequest, declinePendingAccessRequest } from "../utils/backend";

import '../css/manageAccess.css';


export default function ManageAccess() {
    const [error, setError] = useState(null);
    const [modules, setModules] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [pendingAccess, setPendingAccess] = useState([]);
    const [accesses, setAccesses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAdmin, setSelectedAdmin] = useState('');
    const [selectedModules, setSelectedModules] = useState([]);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAccessAdmin, setSelectedAccessAdmin] = useState('');


    useEffect(() => {
        const fetchModules = async () => {
            await getModules(setError, setModules);
        };

        fetchModules();
    }, []);

    useEffect(() => {
        const fetchAdmins = async () => {
            await getAllAdmins(setError, setAdmins);
        };

        fetchAdmins();
    }, []);
    useEffect(() => {
        const fetchPendingAccess = async () => {
            await getPendingAccess(setError, setPendingAccess);
        };

        fetchPendingAccess();
    }, []);

    

    const handleAction = async (id, action) => {
        const payload = { request_id: id }; // Create payload with request ID
        if(!error){
            if (action === 'approve') {
                await approvePendingAccessRequest(payload, setError, (message) => setAlert({ open: true, message, severity: 'success' }));
            } else {
                await declinePendingAccessRequest(payload, setError, (message) => setAlert({ open: true, message, severity: 'error' }));
            }
            // Remove the request from the pending access list after approval or decline
            setPendingAccess(prev => prev.filter(req => req.id !== id));
        }else{
            setAlert({ open: true, message: error, severity: 'error' });
        }
    };
    

    const handleCloseAlert = () => {
        setAlert({ ...alert, open: false });
    };

    const filteredRequests = pendingAccess.filter(request => 
        request.user_id.toString().includes(searchTerm) || 
        request.module_description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedAdmin('');
        setSelectedModules([]);
    };

    const handleModuleChange = (moduleId) => {
        setSelectedModules((prev) =>
            prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
        );
    };

    const handleAddAccess = async () => {
        // Validate selections
        if (!selectedAdmin) {
            setAlert({ open: true, message: 'Please select an admin.', severity: 'error' });
            return;
        }
        if (selectedModules.length === 0) {
            setAlert({ open: true, message: 'Please select at least one module.', severity: 'error' });
            return;
        }
    
        const payload = { user_id: selectedAdmin, modules: selectedModules, hasAccess: true };
        await addNewAccess(payload, setError);
        setAlert({ open: true, message: 'Access added successfully!', severity: 'success' });
        handleCloseDialog();
    };

    const handleAdminChange = async (e) => {
        const adminId = e.target.value;
        setSelectedAccessAdmin(adminId);
        if (adminId) {
            await getAccess({ user_id: adminId }, setError, setAccesses);
        } else {
            setAccesses([]);
        }
    };
    const handleToggleAccess = async (access) => {
        const payload = {
            user_id: access.user_id,
            module_id: access.module_id,
            hasAccess: !access.hasAccess,
        };
        await updateAccess(payload, setError);
        setAccesses(prev =>
            prev.map(item => item.module_id === access.module_id ? { ...item, hasAccess: !item.hasAccess } : item)
        );
    };
    
    
    return (
        <>
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
                }}
            >
                <Container maxWidth="lg" className='manageAccessContainer'>
                <div className="search-container">
        <input
            type="text"
            placeholder="Search"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="searchInput"
        />
        <button className="manageAccess-addButton" onClick={handleOpenDialog}>
            Add New Access
        </button>
    </div>
    <h2>Pending Access Requests</h2>
                    {filteredRequests.length === 0 ? (
                        <table className="accessTable">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Administrator Name</th>
                                <th>Module</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        <tr>
                                <td colSpan={4} style={{textAlign:'center'}}>No Pending Access Request</td>
                            </tr>
                            </tbody>
                            </table>
                    ) : (
                        <table className="accessTable">
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Administrator Name</th>
                                    <th>Module</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map(request => (
                                    <tr key={request.id}>
                                        <td>{request.user_id}</td>
                                        <td>{request.name}</td>
                                        <td>{request.description}</td>
                                        <td style={{alignItems:'center', justifyContent:'center'}}>
                                            <button className="approve" onClick={() => handleAction(request.id, 'approve')}>Approve</button>
                                            <button className="decline" onClick={() => handleAction(request.id, 'decline')}>Decline</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

<h2 style={{marginBottom:'10px'}}>View Admin Access</h2>
                <label>
                    Select Admin:
                    <select value={selectedAccessAdmin} onChange={handleAdminChange}>
                        <option value="">Select Admin</option>
                        {admins.map(admin => (
                            <option key={admin.id} value={admin.id}>{admin.name}</option>
                        ))}
                    </select>
                </label>

                {accesses.length > 0 ? (
                    <table className="accessTable">
                        <thead>
                            <tr>
                                <th>Module</th>
                                <th>Access Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accesses.length > 0 && accesses.map(access => (
                                <tr key={access.module_id}>
                                    <td>{access.module_description}</td>
                                    <td>{access.hasAccess ? 'Enabled' : 'Disabled'}</td>
                                    <td>
                                        <button className={access.hasAccess ? "disable" : "enable"} onClick={() => handleToggleAccess(access)}>
                                            {access.hasAccess ? 'Disable' : 'Enable'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ):(<table className="accessTable">
                    <thead>
                        <tr>
                            <th>Module</th>
                            <th>Access Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        
                            <tr>
                                <td colSpan={3} style={{textAlign:'center'}}>No Access to any Module</td>
                            </tr>
                    </tbody>
                </table>) }
                
                {dialogOpen && (
                    <div className="manageAccess-dialogOverlay">
                        <div className="manageAccess-dialog">
                            <div className="manageAccess-dialogHeader">
                                <h2>Add New Access</h2>
                                <button className="manageAccess-closeButton" onClick={handleCloseDialog}>✖</button>
                            </div>
                            <div className="manageAccess-dialogContent">
                                <label className="manageAccess-selectAdmin">
                                    Select Admin:
                                    <select value={selectedAdmin} onChange={(e) => setSelectedAdmin(e.target.value)}>
                                        <option value="">Select Admin</option>
                                        {admins.map((admin) => (
                                            <option key={admin.id} value={admin.id}>
                                                {admin.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <div className="manageAccess-moduleSelection">
                                    <h3>Select Modules:</h3>
                                    <div className="manageAccess-moduleGrid">
                                        {modules.map((module) => (
                                            <label key={module.id} className="manageAccess-moduleLabel">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedModules.includes(module.id)}
                                                    onChange={() => handleModuleChange(module.id)}
                                                />
                                                {module.description}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="manageAccess-dialogFooter">
                                <button className="manageAccess-submitButton" onClick={handleAddAccess}>Submit</button>
                            </div>
                        </div>
                    </div>
                )}

                
{alert.open && (
    <div className={`custom-alert ${alert.severity}`}>
        <div className="alert-content">
            <span className="alert-message">{alert.message}</span>
            <button className="alert-close" onClick={handleCloseAlert}>Close</button>
        </div>
    </div>
)}


                </Container>
            </Box >
        </>
    );
}