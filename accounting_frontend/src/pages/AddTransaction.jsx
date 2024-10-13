import { Box, Container, Toolbar } from "@mui/material";
import React, { useState, useEffect } from 'react';
import '../css/addTransaction.css';
import { addTransaction, getClients } from "../utils/backend";
import { useStateContext } from "../context/ContextProvider";

const AddTransaction = () => {
    const [clients, setClients] = useState([]);
    const [error, setError] = useState({});
    let { user } = useStateContext();
    const transactionTypes = [
        { id: 1, name: 'Asset' },
        { id: 2, name: 'Liabilities' },
        { id: 3, name: 'Equity' },
        { id: 4, name: 'Revenue' },
        { id: 5, name: 'Expense' },
        { id: 6, name: 'Sale' },
        { id: 7, name: 'Purchase' },
        { id: 8, name: 'Loan' },
        { id: 9, name: 'Dividends' }
    ];

    useEffect(() => {
        getClients(setError, setClients);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {};
        for (let [key, value] of formData.entries()) {
            if (key === 'transactionTypes[]') {
                if (!data.transactionTypes) {
                    data.transactionTypes = [];
                }
                data.transactionTypes.push(value);
            } else {
                data[key] = value;
            }
        }

        // Set status based on userType
        data.status = user.userType === 'client' ? 'Pending' : 'Approved';

        // Perform other validations as needed
        // If all validations pass, submit the form
        addTransaction(data, setError, e);
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
            <Container maxWidth="lg" className='tableContainer'>
                <div className="addTransactionForm">
                    <form onSubmit={handleSubmit}>
                        <div className="addTransactionInputs">

                            <label>
                                Description:
                                <input type="text" name="description" />
                            </label>
                            {error && <span className="error">{error.description}</span>}
                            <label>
                                Client:
                                <select name="clientID">
                                    {user.userType === 'client' ? (
                                        <option value={user.id}>{user.company}</option>
                                    ) : (
                                        user.userType === 'admin' || user.userType === 'superadmin' && clients.map(client => (
                                            <option key={client.id} value={client.id}>{client.company}</option>
                                        ))
                                    )}
                                </select>
                            </label>
                            {error && <span className="error">{error.clientID}</span>}
                            <label>
                                Transaction Types:
                                <div className="ttypeContainer">
                                    {transactionTypes.map(type => (
                                        <div key={type.id}>
                                            <input type="checkbox" name="transactionTypes[]" value={type.id} />
                                            <label className="ttype">{type.name}</label>
                                        </div>
                                    ))}
                                </div>
                            </label>
                            {error && <span className="error">{error.transactionType}</span>}
                        </div>
                        <div className="addTransactionInputsRight">
                            <label>
                                Amount:
                                <input type="number" name="amount" />
                            </label>
                            {error && <span className="error">{error.amount}</span>}
                            <label>
                                Transaction Category:
                                <select name="category" >
                                    <option value="Operating">Operating</option>
                                    <option value="Investing">Investing</option>
                                    <option value="Financing">Financing</option>
                                </select>
                            </label>
                            <label>
                                Cash flow:
                                <select name="cashFlow" >
                                    <option value="Inflow">Inflow</option>
                                    <option value="Outflow">Outflow</option>
                                </select>
                            </label>
                            {error && <span className="error">{error.cashFlowCategory}</span>}
                            <label>
                                Product Line:
                                <input type="text" name="productLine" />
                            </label>
                            {error && <span className="error">{error.productLine}</span>}
                        </div>
                        <button className="addTransactionButton" type="submit">Submit</button>
                    </form>
                </div>
            </Container>
        </Box>
    );
};

export default AddTransaction;
