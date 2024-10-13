import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import '../css/transaction.css';
import { Link } from 'react-router-dom';
import { filterTransactions } from '../utils/backend';
import { useStateContext } from '../context/ContextProvider';

const Filters = ({ setError, setTransactions, setLoading }) => {
    // State for each filter
    const [transactionType, setTransactionType] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [category, setCategory] = useState('');
    const [balance, setBalance] = useState('');
    const [activity, setActivity] = useState('');
    const [fromDate, setFromDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [searchText, setSearchText] = useState('');
    const { user } = useStateContext();

    // Function to log the current state of filters
    const handleFilterChange = () => {
        const payload = {
            fromDate,
            toDate,
            transactionType,
            paymentMethod,
            category,
            balance,
            activity,
            searchText
        };

        if (user.userType === 'client') {
            payload.company = user.company;
        }

        fetchTransactions(payload);

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

    const fetchTransactions = useCallback(debounce((payload) => {
        setLoading(true);
        filterTransactions(setError, setTransactions, payload)
            .finally(() => setLoading(false));
    }, 500), []);


    // Effect to run the handleFilterChange function whenever any state changes
    useEffect(() => {
        handleFilterChange();
    }, [fromDate, toDate, transactionType, paymentMethod, category, balance, activity, searchText]);

    return (
        <div className="filters-container">
            <div className="select-container">
                <div className="grid-container">
                    <div className="grid-item">
                        <label htmlFor="from-date">From</label>
                        <input
                            type="date"
                            id="from-date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="grid-item">
                        <label htmlFor="to-date">To</label>
                        <input
                            type="date"
                            id="to-date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <div className="grid-item">
                        <label htmlFor="transaction-type">Transaction Type</label>
                        <select
                            id="transaction-type"
                            value={transactionType}
                            onChange={(e) => setTransactionType(e.target.value)}
                        >
                            <option value="">Select Transaction Type</option>
                            <option value="Asset">Asset</option>
                            <option value="Liabilities">Liabilities</option>
                            <option value="Equity">Equity</option>
                            <option value="Revenue">Revenue</option>
                            <option value="Expense">Expense</option>
                            <option value="Sale">Sale</option>
                            <option value="Purchase">Purchase</option>
                            <option value="Loan">Loan</option>
                            <option value="Dividends">Dividends</option>
                        </select>
                    </div>

                    <div className="grid-item">
                        <label htmlFor="category">Cash Flow Category</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Select Category</option>
                            <option value="Operating">Operating</option>
                            <option value="Investing">Investing</option>
                            <option value="Financing">Financing</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="search-container">
                <input
                    type="text"
                    id="search-field"
                    placeholder="Search"
                    className="filter"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <Link to="/add-transaction" className="new-transaction-btn">New Transaction</Link>
            </div>
        </div>
    );
};

export default Filters;
