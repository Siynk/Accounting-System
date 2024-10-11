import React, { useState } from 'react';
import '../css/editTransactionModal.css';
import CloseIcon from '@mui/icons-material/Close';
import { updateTransaction } from '../utils/backend';
import { useStateContext } from '../context/ContextProvider';

const EditTransactionModal = ({ transaction, onClose }) => {
    let { user } = useStateContext();
    const [newDescription, setNewDescription] = useState(transaction.description);
    const [newAmount, setNewAmount] = useState(transaction.amount);
    const [error, setError] = useState({});
    const handleSave = () => {
        const payload = {
            newDescription,
            clientID: transaction.clientID,
            newAmount,
            transactionID: transaction.id,
            status: user.userType === 'admin' ? 'Approve' : 'Pending'
        };
        updateTransaction(setError, payload);

        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className='modal-header'>
                    <h2 style={{ fontWeight: "550" }}>Edit Transaction</h2>
                    <CloseIcon className='modal-close-button' onClick={onClose} />
                </div>
                <hr />
                <div className='modal-content'>


                    <div className="form-group-modal">
                        <label>Description</label>
                        <input
                            type="text"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                        />
                        {error && <span className="modal-error">{error.newDescription}</span>}
                    </div>

                    <div className="form-group-modal">
                        <label>Amount</label>
                        <input
                            type="number"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                        />
                        {error && <span className="modal-error">{error.newAmount}</span>}
                    </div>
                    <button className='modal-button' onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default EditTransactionModal;
