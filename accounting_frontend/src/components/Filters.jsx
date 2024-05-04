import React from 'react';
import dayjs from 'dayjs';
import '../css/transaction.css';
import { Link } from 'react-router-dom';

const Filters = () => {
    // State for each filter
    const [transactionType, setTransactionType] = React.useState('');
    const [paymentMethod, setPaymentMethod] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [balance, setBalance] = React.useState('');
    const [activity, setActivity] = React.useState('');
    let dateNow = dayjs().format('YYYY-MM-DD');

    return (
        <div className="filters-container">
            <div className="select-container">
                <div className="grid-container">
                    <div className="grid-item">
                        <label htmlFor="from-date">From</label>
                        <input type="date" id="from-date" value={dateNow} onChange={(e) => setValue(e.target.value)} />
                    </div>
                    <div className="grid-item">
                        <label htmlFor="to-date">To</label>
                        <input type="date" id="to-date" value={dateNow} onChange={(e) => setValue(e.target.value)} />
                    </div>
                    <div className="grid-item">
                        <label htmlFor="transaction-type">Transaction Type</label>
                        <select id="transaction-type" value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                            <option value="Cash In">Cash In</option>
                            <option value="Cash Out">Cash Out</option>
                        </select>
                    </div>
                    <div className="grid-item">
                        <label htmlFor="payment-method">Payment Method</label>
                        <select id="payment-method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                            <option value="Cash">Cash</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Debit Card">Debit Card</option>
                            <option value="Check">Check</option>
                            <option value="Online">Online</option>
                        </select>
                    </div>
                    <div className="grid-item">
                        <label htmlFor="category">Category</label>
                        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="Earnings">Earnings</option>
                            <option value="Expenditures">Expenditures</option>
                        </select>
                    </div>
                    <div className="grid-item">
                        <label htmlFor="balance">Accounts</label>
                        <select id="balance" value={balance} onChange={(e) => setBalance(e.target.value)}>
                            <option value="Payable">Payable</option>
                            <option value="Receivable">Receivable</option>
                        </select>
                    </div>
                    <div className="grid-item">
                        <label htmlFor="activity">Activity</label>
                        <select id="activity" value={activity} onChange={(e) => setActivity(e.target.value)}>
                            <option value="Operating">Operating</option>
                            <option value="Investing">Investing</option>
                            <option value="Financing">Financing</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="search-container">
                <input type="text" id="search-field" placeholder="Search" className="filter" />
                <Link to="/add-transaction" className="new-transaction-btn">New Transaction</Link>
            </div>
        </div>
    );
};

export default Filters;
