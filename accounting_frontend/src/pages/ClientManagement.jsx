import { Table, TableBody, TableCell, TableHead, TableRow, Box, Toolbar, Container, CircularProgress } from '@mui/material';
import ViewIcon from '@mui/icons-material/Visibility';
import UpdateIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import '../css/clientManagement.css';
import { useState, useEffect, useCallback } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useStateContext } from '../context/ContextProvider';
import EditUserModal from '../components/EditUserModal';
import {
    deleteUser,
    filterClients,
    getPendingClientRegistrationRequests,
    respondToClientRequest,
    getPendingTemporaryTransactionEdits,
    getClientPendingTransactionRequests,
    respondToPendingTransactionEdit,
    respondToPendingTransactionRequest
} from '../utils/backend';

const ClientManagement = () => {
    let { setViewClient } = useStateContext();

    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [pendingRequests, setPendingRequests] = useState([]);
    const [pendingTransactionRequests, setPendingTransactionRequests] = useState([]);
    const [pendingTemporaryEdits, setPendingTemporaryEdits] = useState([]);

    const handleUserSearch = () => {
        const payload = {
            searchText
        };
        fetchUsers(payload);

    };

    const handleView = (user) => {
        setViewClient(user);
    };

    const handleUpdatePopup = (user) => {
        setSelectedUser(user);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
    };

    const handleDelete = (id) => {
        deleteUser(setError, { id });
    };

    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const fetchUsers = useCallback(debounce((payload) => {
        setLoading(true);
        filterClients(setError, setUsers, payload)
            .finally(() => setLoading(false));
    }, 500), []);

    useEffect(() => {
        handleUserSearch();
    }, [searchText]);

    const fetchPendingRequests = useCallback(() => {
        setLoading(true);
        getPendingClientRegistrationRequests(setError, setPendingRequests)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingTransactionRequests = useCallback(() => {
        setLoading(true);
        getClientPendingTransactionRequests(setError, setPendingTransactionRequests)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchPendingTransactionRequests();
    }, []);

    const fetchPendingTemporaryEdits = useCallback(() => {
        setLoading(true);
        getPendingTemporaryTransactionEdits(setError, setPendingTemporaryEdits)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchPendingTemporaryEdits();
    }, []);

    const handleApprove = (id) => {
        respondToClientRequest({ userID: id, status: 'Approved' }, setError)
            .then(response => {
                toast.success("Successfully Approved");
                fetchPendingRequests(); // Refresh the pending requests
            })
            .catch(err => {
                toast.error(err.message);
            });
    };

    const handleDecline = (id) => {
        respondToClientRequest({ userID: id, status: 'Declined' }, setError)
            .then(response => {
                toast.success('Declined Request');
                fetchPendingRequests(); // Refresh the pending requests
            })
            .catch(err => {
                toast.error(err.message);
            });
    };

    const handleApproveRequest = (id) => {
        respondToPendingTransactionRequest({ requestID: id, status: 'Approved' }, setError)
            .then(response => {
                toast.success("Transaction Request Approved");
                fetchPendingTransactionRequests(); // Refresh the pending requests
            })
            .catch(err => {
                toast.error(err.message);
            });
    };

    const handleDeclineRequest = (id) => {
        respondToPendingTransactionRequest({ requestID: id, status: 'Declined' }, setError)
            .then(response => {
                toast.success("Transaction Request Declined");
                fetchPendingTransactionRequests(); // Refresh the pending requests
            })
            .catch(err => {
                toast.error(err.message);
            });
    };

    const handleApproveEdit = (id) => {
        respondToPendingTransactionEdit({ editID: id, status: 'Approved' }, setError)
            .then(response => {
                toast.success("Edit Request Approved");
                fetchPendingTemporaryEdits(); // Refresh the pending edits
            })
            .catch(err => {
                toast.error(err.message);
            });
    };

    const handleDeclineEdit = (id) => {
        respondToPendingTransactionEdit({ editID: id, status: 'Declined' }, setError)
            .then(response => {
                toast.success("Edit Request Declined");
                fetchPendingTemporaryEdits(); // Refresh the pending edits
            })
            .catch(err => {
                toast.error(err.message);
            });
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
            }}
        >
            <Toolbar />
            {<Container maxWidth="lg" className='tableContainer'>
                <div className="search-container-client">
                    <input
                        type="text"
                        id="search-field"
                        placeholder="Search Client"
                        className="filter-client"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                <h2>Pending Client Registration Requests</h2>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <Table className="user-table" aria-label="pending requests table">
                        <TableHead>
                            <TableRow>
                                <TableCell><span className='user-header'>NAME</span></TableCell>
                                <TableCell><span className='user-header'>EMAIL</span></TableCell>
                                <TableCell><span className='user-header'>ACTIONS</span></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">No Pending Registration Requests</TableCell>
                                </TableRow>
                            ) : (
                                pendingRequests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell><span className='user-content'>{request.user.name}</span></TableCell>
                                        <TableCell><span className='user-content'>{request.user.email}</span></TableCell>
                                        <TableCell>
                                            <div className='actions-container'>
                                                <span className='actions approve' onClick={() => handleApprove(request.userID)}>
                                                    <CheckIcon /> Approve
                                                </span>
                                                <span className='actions decline' onClick={() => handleDecline(request.userID)}>
                                                    <CloseIcon /> Decline
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}

                {/* New Section: Pending Transaction Requests */}
                <h2 className="pending-transaction-title">Pending Transaction Requests</h2>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <Table className="pending-transaction-table" aria-label="pending transaction requests table">
                        <TableHead>
                            <TableRow>
                                <TableCell><span className='pending-transaction-header'>TRANSACTION ID</span></TableCell>
                                <TableCell><span className='pending-transaction-header'>CLIENT NAME</span></TableCell>
                                <TableCell><span className='pending-transaction-header'>AMOUNT</span></TableCell>
                                <TableCell><span className='pending-transaction-header'>ACTIONS</span></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingTransactionRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No Pending Transaction Requests</TableCell>
                                </TableRow>
                            ) : (
                                pendingTransactionRequests.map((request) => (
                                    <TableRow key={request.id} className="pending-transaction-row">
                                        <TableCell><span className='pending-transaction-content'>{request.transactionID}</span></TableCell>
                                        <TableCell><span className='pending-transaction-content'>{request.client_name}</span></TableCell>
                                        <TableCell><span className='pending-transaction-content'>{request.transaction_amount}</span></TableCell>
                                        <TableCell>
                                            <div className='pending-transaction-actions'>
                                                <span className='pending-transaction-approve' onClick={() => handleApproveRequest(request.id)}>
                                                    <CheckIcon /> Approve
                                                </span>
                                                <span className='pending-transaction-decline' onClick={() => handleDeclineRequest(request.id)}>
                                                    <CloseIcon /> Decline
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}

                {/* New Section: Pending Temporary Transaction Edits */}
                <h2 className="pending-edit-title">Pending Temporary Edits</h2>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <Table className="pending-edit-table" aria-label="pending temporary edits table">
                        <TableHead>
                            <TableRow>
                                <TableCell><span className='pending-edit-header'>EDIT ID</span></TableCell>
                                <TableCell><span className='pending-edit-header'>CLIENT NAME</span></TableCell>
                                <TableCell><span className='pending-edit-header'>NEW DESCRIPTION</span></TableCell>
                                <TableCell><span className='pending-edit-header'>CURRENT AMOUNT</span></TableCell>
                                <TableCell><span className='pending-edit-header'>NEW AMOUNT</span></TableCell>
                                <TableCell><span className='pending-edit-header'>ACTIONS</span></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingTemporaryEdits.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">No Pending Temporary Edits</TableCell>
                                </TableRow>
                            ) : (
                                pendingTemporaryEdits.map((edit) => (
                                    <TableRow key={edit.id} className="pending-edit-row">
                                        <TableCell><span className='pending-edit-content'>{edit.id}</span></TableCell>
                                        <TableCell><span className='pending-edit-content'>{edit.client_name}</span></TableCell>
                                        <TableCell><span className='pending-edit-content'>{edit.newDescription}</span></TableCell>
                                        <TableCell><span className='pending-edit-content'>{edit.transaction_amount}</span></TableCell>
                                        <TableCell><span className='pending-edit-content'>{edit.newAmount}</span></TableCell>
                                        <TableCell>
                                            <div className='pending-edit-actions'>
                                                <span className='pending-edit-approve' onClick={() => handleApproveEdit(edit.id)}>
                                                    <CheckIcon /> Approve
                                                </span>
                                                <span className='pending-edit-decline' onClick={() => handleDeclineEdit(edit.id)}>
                                                    <CloseIcon /> Decline
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}

                <Table className="user-table" aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell><span className='user-header'>NAME</span></TableCell>
                            <TableCell><span className='user-header'>USERNAME</span></TableCell>
                            <TableCell><span className='user-header'>USER TYPE</span></TableCell>
                            <TableCell><span className='user-header'>ADDRESS</span></TableCell>
                            <TableCell><span className='user-header'>EMAIL</span></TableCell>
                            <TableCell><span className='user-header'>CONTACT</span></TableCell>
                            <TableCell><span className='user-header'>COMPANY</span></TableCell>
                            <TableCell><span className='user-header'>ACTIONS</span></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center"><CircularProgress /></TableCell>
                            </TableRow>
                        ) : (
                            users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center">No Records Found</TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell><span className='user-content'>{user.name}</span></TableCell>
                                        <TableCell><span className='user-content'>{user.username}</span></TableCell>
                                        <TableCell><span className='user-content'>{user.userType}</span></TableCell>
                                        <TableCell><span className='user-content'>{user.address}</span></TableCell>
                                        <TableCell><span className='user-content'>{user.email}</span></TableCell>
                                        <TableCell><span className='user-content'>{user.contact}</span></TableCell>
                                        <TableCell><span className='user-content'>{user.company ? user.company : 'N/A'}</span></TableCell>
                                        <TableCell>
                                            <div className='actions-container'>
                                                <span onClick={() => handleView(user)}><Link className='actions view' to="/view-client"><ViewIcon /></Link></span>
                                                <span className='actions update' onClick={() => handleUpdatePopup(user)}><UpdateIcon /></span>
                                                <span className='actions delete' onClick={() => handleDelete(user.id)}><DeleteIcon /></span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )
                        )}
                    </TableBody>
                </Table>
            </Container>}
            {selectedUser && (
                <EditUserModal
                    user={selectedUser}
                    onClose={handleCloseModal}
                />
            )}
        </Box >
    );
}

export default ClientManagement;
