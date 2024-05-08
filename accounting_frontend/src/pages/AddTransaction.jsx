import { Box, Container, Toolbar } from "@mui/material";
import React, { useState } from 'react';
import '../css/addTransaction.css';
import { addTransaction } from "../utils/backend";


const AddTransaction = () => {
    const [selectedAccount, setSelectedAccount] = useState('');
    const [error, setError] = useState({});
    const handleAccountChange = (e) => {
        setSelectedAccount(e.target.value);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        console.log(data);
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
                                Transaction Type:
                                <select name="transactionType" >
                                    <option value="Cash In">Cash In</option>
                                    <option value="Cash Out">Cash Out</option>
                                </select>
                            </label>
                            <label>
                                Description:
                                <input type="text" name="description" />
                            </label>
                            {error && <span className="error">{error.description}</span>}
                            <label>
                                Payment Method:
                                <select name="paymentMethod" className="addTransactionSelect">
                                    <option value="Cash">Cash</option>
                                    <option value="Creadit Card">Credit Card</option>
                                    <option value="Debit Card">Debit Card</option>
                                    <option value="Check">Check</option>
                                    <option value="Online">Online</option>
                                </select>
                            </label>
                            {error && <span className="error">{error.paymentMethod}</span>}
                            <label>
                                Client:
                                <input type="text" name="counterParty" />
                            </label>
                            {error && <span className="error">{error.counterParty}</span>}
                        </div>
                        <div className="addTransactionInputs">
                            <label>
                                Amount:
                                <input type="number" name="amount" />
                            </label>
                            {error && <span className="error">{error.amount}</span>}
                            <label>
                                Category:
                                <select name="category" >
                                    <option value="Earnings">Earnings</option>
                                    <option value="Expenditures">Expenditures</option>
                                </select>
                            </label>
                            {error && <span className="error">{error.category}</span>}
                            <label>
                                Accounts:
                                <select name="accounts" onChange={handleAccountChange}>
                                    <option>None</option>
                                    <option value="receivable">Receivable</option>
                                    <option value="payable">Payable</option>
                                </select>
                            </label>
                            {error && <span className="error">{error.accounts}</span>}
                            {selectedAccount === 'receivable' || selectedAccount === 'payable' ? (
                                <>
                                    <label>
                                        Due Date:
                                        <input type="date" name="effectivityDate" />
                                    </label>
                                    {error && <span className="error">{error.effectivityDate}</span>}
                                </>
                            ) : null}
                            <label>
                                Activity:
                                <select name="activity" >
                                    <option value="Operating">Operating</option>
                                    <option value="Investing">Investing</option>
                                    <option value="Financing">Financing</option>
                                </select>
                            </label>
                            {error && <span className="error">{error.activity}</span>}
                        </div>
                        <button className="addTransactionButton" type="submit">Submit</button>
                    </form>
                </div>

            </Container>
        </Box >
    );
}

export default AddTransaction;
