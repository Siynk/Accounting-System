import React, { useState } from 'react';
import '../css/editUserModal.css';
import CloseIcon from '@mui/icons-material/Close';
import { updateClient } from '../utils/backend';
import { useStateContext } from '../context/ContextProvider';

const EditUserModal = ({ user, onClose }) => {
    let { currentUser } = useStateContext();
    const [name, setName] = useState(user.name);
    const [username, setUsername] = useState(user.username);
    const [address, setAddress] = useState(user.address);
    const [email, setEmail] = useState(user.email);
    const [contact, setContact] = useState(user.contact);
    const [company, setCompany] = useState(user.company);
    const [error, setError] = useState({});

    const handleSave = () => {
        const payload = {
            name,
            username,
            address,
            email,
            contact,
            company,
            userID: user.id,
            status: currentUser.userType === 'admin' ? 'Approve' : 'Pending'
        };
        updateClient(setError, payload);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className='modal-header'>
                    <h2 style={{ fontWeight: "550" }}>Edit User</h2>
                    <CloseIcon className='modal-close-button' onClick={onClose} />
                </div>
                <hr />
                <div className='modal-content'>
                    <div className="form-group-modal">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {error && <span className="modal-error">{error.name}</span>}
                    </div>

                    <div className="form-group-modal">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        {error && <span className="modal-error">{error.username}</span>}
                    </div>

                    <div className="form-group-modal">
                        <label>Address</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                        {error && <span className="modal-error">{error.address}</span>}
                    </div>

                    <div className="form-group-modal">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {error && <span className="modal-error">{error.email}</span>}
                    </div>

                    <div className="form-group-modal">
                        <label>Contact</label>
                        <input
                            type="text"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                        />
                        {error && <span className="modal-error">{error.contact}</span>}
                    </div>

                    <div className="form-group-modal">
                        <label>Company</label>
                        <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                        />
                        {error && <span className="modal-error">{error.company}</span>}
                    </div>
                    <button className='modal-button' onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;
