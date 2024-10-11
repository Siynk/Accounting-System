import { Table, TableBody, TableCell, TableHead, TableRow, Box, Toolbar, Container, CircularProgress } from '@mui/material';
import ViewIcon from '@mui/icons-material/Visibility';
import UpdateIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import '../css/clientManagement.css';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';
import EditUserModal from '../components/EditUserModal';
import { deleteUser, filterClients } from '../utils/backend';

const ClientManagement = () => {
    let { setViewClient } = useStateContext();

    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

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
