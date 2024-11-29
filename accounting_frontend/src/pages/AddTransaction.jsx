import { Box, Container, Toolbar } from "@mui/material";
import React, { useState, useEffect, useRef } from 'react';
import '../css/addTransaction.css';
import { addTransaction, getClients, getApprovedProjects } from "../utils/backend";
import { useStateContext } from "../context/ContextProvider";

const AddTransaction = () => {
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedClient, setSelectedClient] = useState("N/A"); // Default to 'N/A'
    const [selectedProject, setSelectedProject] = useState("N/A"); // Default to 'N/A'
    const [showClientProjectFields, setShowClientProjectFields] = useState(false);
    const [showMaterialFields, setShowMaterialFields] = useState(false); // State for material fields
    const [materialPrice, setMaterialPrice] = useState(0); // State for material price
    const [materialQuantity, setMaterialQuantity] = useState(0); // State for material quantity
    const [amount, setAmount] = useState(0); // State for amount field
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
        { id: 9, name: 'Dividends' },
        { id: 10, name: 'Payment' },
        { id: 11, name: 'Receivable' }
    ];

    const formRef = useRef(); // Create a ref for the form

    useEffect(() => {
        const fetchClients = async () => {
            await getClients(setError, setClients);
        };
        fetchClients();
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            if (selectedClient !== "N/A") {
                await getApprovedProjects({ clientID: selectedClient }, setError, setProjects);
            }
        };
        fetchProjects();
    }, [selectedClient]);

    const handleClientChange = (e) => {
        setSelectedClient(e.target.value);
        setSelectedProject("N/A"); // Reset project selection when client is changed
    };

    const handleProjectChange = (e) => {
        setSelectedProject(e.target.value);
    };

    const handleMaterialPriceChange = (e) => {
        setMaterialPrice(e.target.value);
    };

    const handleMaterialQuantityChange = (e) => {
        setMaterialQuantity(e.target.value);
    };

    // Update Amount when Material Fields are shown or the material values change
    useEffect(() => {
        if (showMaterialFields) {
            setAmount(materialPrice * materialQuantity); // Calculate amount based on material fields
        }
    }, [showMaterialFields, materialPrice, materialQuantity]);

    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Temporarily enable the amount field
      const amountInput = document.querySelector('input[name="amount"]');
      amountInput.disabled = false;  // Enable amount input temporarily
  
      const formData = new FormData(e.target);
      const data = {};
  
      // Loop through the form data entries
      for (let [key, value] of formData.entries()) {
          if (key === 'transactionTypes[]') {
              // If it's a checkbox field (transaction types), collect all selected values
              if (!data.transactionTypes) {
                  data.transactionTypes = [];
              }
              data.transactionTypes.push(value);
          } else {
              data[key] = value;
          }
      }
  
      if (showClientProjectFields) {
          data.transactionStatus = 'Unsettled';
      } else {
          data.transactionStatus = '';
      }
  
      // Set status based on userType
      data.status = user.userType === 'client' ? 'Pending' : 'Approved';
  
      // Call the addTransaction function to submit the data
      addTransaction(data, setError, e);

      // Reset all states after form submission
      resetForm();
  
      // Re-disable the amount field after submission
      amountInput.disabled = true;
  };

  const resetForm = () => {
    // Reset form fields
    if (formRef.current) {
        formRef.current.reset();
    }
    
    // Reset state variables to their default values
    setSelectedClient("N/A");
    setSelectedProject("N/A");
    setShowClientProjectFields(false);
    setShowMaterialFields(false);
    setMaterialPrice(0);
    setMaterialQuantity(0);
    setAmount(0);
    setError({});
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
            <Container maxWidth="lg" className='tableContainer' sx={{ marginBottom: 10 }}>
                <div className="addTransactionForm">
                    <form ref={formRef} onSubmit={handleSubmit}>
                        <div className="addTransactionInputs">
                            <label>
                                Description:
                                <input type="text" name="description" />
                            </label>
                            {error && <span className="error">{error.description}</span>}

                            {/* Button to show client/project fields */}
                            {user.userType !== 'client' && (
                                <button
                                    type="button"
                                    style={{ background: '#007bff', width: '100%' }}
                                    onClick={() => setShowClientProjectFields(!showClientProjectFields)}
                                >
                                    For Client Transaction
                                </button>
                            )}

                            {/* Show Client and Project select fields only when the button is clicked */}
                            {showClientProjectFields && (
                                <>
                                    <label>
                                        Client:
                                        <select name="clientID" value={selectedClient} onChange={handleClientChange}>
                                            <option value="N/A">Select Client</option>
                                            {user.userType === 'client' ? (
                                                <option value={user.id}>{user.company}</option>
                                            ) : (
                                                (user.userType === 'admin' || user.userType === 'superadmin') && clients.map(client => (
                                                    <option key={client.id} value={client.id}>{client.company}</option>
                                                ))
                                            )}
                                        </select>
                                    </label>

                                    {error && <span className="error">{error.clientID}</span>}

                                    <label style={{marginTop:-10}}>
                                        Approved Project:
                                        <select name="projectID" value={selectedProject} onChange={handleProjectChange}>
                                            <option value="N/A">Select Project</option>
                                            {projects.length > 0 ? (
                                                projects.map(project => (
                                                    <option key={project.id} value={project.project_id}>{project.projectName}</option>
                                                ))
                                            ) : (
                                                <option>No projects available</option>
                                            )}
                                        </select>
                                    </label>
                                    {error && <span className="error">{error.projectID}</span>}

                                    {/* Include Material Button */}
                                    <button
                                        type="button"
                                        style={{ background: showMaterialFields ? '#dc3545' : '#28a745', width: '100%' }}
                                        onClick={() => setShowMaterialFields(!showMaterialFields)}
                                    >
                                        {showMaterialFields && "Don't "}Include Material
                                    </button>

                                    {/* Material Fields (hidden unless Include Material is clicked) */}
                                    {showMaterialFields && (
                                        <div>
                                            <label>
                                                Material Name:
                                                <input type="text" name="materialName" />
                                            </label>
                                            <label>
                                                Material Price:
                                                <input type="number" name="materialPrice" value={materialPrice} onChange={handleMaterialPriceChange} />
                                            </label>
                                            <label>
                                                Material Quantity:
                                                <input type="number" name="materialQuantity" value={materialQuantity} onChange={handleMaterialQuantityChange} />
                                            </label>
                                        </div>
                                    )}
                                </>
                            )}

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
                                <input
                                    type="number"
                                    name="amount"
                                    value={showMaterialFields ? amount : amount} // Update the value based on whether material fields are shown
                                    disabled={showMaterialFields} // Disable if showMaterialFields is true
                                    onChange={(e) => {
                                        // Allow manual input if material fields are not shown
                                        if (!showMaterialFields) {
                                            setAmount(e.target.value);
                                        }
                                    }}
                                />
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
                                Segment:
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
