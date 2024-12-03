import { Box, Container, Toolbar, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import React, { useState, useEffect, useRef } from 'react';
import '../css/addTransaction.css';
import { addTransaction, getClients, getApprovedProjects } from "../utils/backend";
import { useStateContext } from "../context/ContextProvider";

const AddTransaction = () => {
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedClient, setSelectedClient] = useState("N/A");
    const [selectedProject, setSelectedProject] = useState("N/A");
    const [showClientProjectFields, setShowClientProjectFields] = useState(false);
    const [showMaterialFields, setShowMaterialFields] = useState(false);
    const [amount, setAmount] = useState(0);
    const [materials, setMaterials] = useState([]);
    const [newMaterial, setNewMaterial] = useState({ name: "", price: 0, quantity: 0 });
    const [openMaterialDialog, setOpenMaterialDialog] = useState(false);
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

    const formRef = useRef();

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
        setSelectedProject("N/A");
    };

    const handleProjectChange = (e) => {
        setSelectedProject(e.target.value);
    };

    const handleMaterialNameChange = (e) => {
        setNewMaterial({ ...newMaterial, name: e.target.value });
    };

    const handleMaterialPriceChange = (e) => {
        setNewMaterial({ ...newMaterial, price: parseFloat(e.target.value) });
    };

    const handleMaterialQuantityChange = (e) => {
        setNewMaterial({ ...newMaterial, quantity: parseInt(e.target.value, 10) });
    };

    // Update Amount based on materials in state
    useEffect(() => {
        const totalAmount = materials.reduce((sum, material) => sum + (material.price * material.quantity), 0);
        setAmount(totalAmount);
    }, [materials]);

    const handleAddMaterial = () => {
        if (newMaterial.name && newMaterial.price && newMaterial.quantity) {
            setMaterials([...materials, newMaterial]);
            setNewMaterial({ name: "", price: 0, quantity: 0 });
            setOpenMaterialDialog(false); // Close dialog after adding
        } else {
            setError({ ...error, material: "Please fill all fields for the material" });
        }
    };

    const handleRemoveMaterial = (index) => {
        setMaterials(materials.filter((_, i) => i !== index));
    };

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

        data.materials = materials;
        data.amount = amount;

        if (showClientProjectFields) {
            data.transactionStatus = 'Unsettled'; 
        } else {
            data.transactionStatus = ''; 
        }

        data.status = user.userType === 'client' ? 'Pending' : 'Approved';

        addTransaction(data, setError, e);

        resetForm();
    };

    const resetForm = () => {
        if (formRef.current) {
            formRef.current.reset();
        }

        setSelectedClient("N/A");
        setSelectedProject("N/A");
        setShowClientProjectFields(false);
        setShowMaterialFields(false);
        setMaterials([]);
        setAmount(0);
        setError({});
    };
    

    return (
        <Box
            component="main"
            sx={{
                backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
                flexGrow: 1,
                height: '100vh',
                overflow: 'auto',
            }}
        >
            <Toolbar />
            <Container maxWidth="xl" className='tableContainer' sx={{ marginBottom: 10 }}>
                <div className="addTransactionForm">
                    <form ref={formRef} onSubmit={handleSubmit}>
                        <div className="addTransactionInputs">
                            <label>
                                Description:
                                <input type="text" name="description" />
                            </label>
                            {error?.description && <span className="error">{error.description}</span>} 

                            {user.userType !== 'client' && (
                                <Button
                                    variant="contained"
                                    onClick={() => setShowClientProjectFields(!showClientProjectFields)}
                                    sx={{ backgroundColor: '#007bff', width: '100%', marginBottom: '10px' }}
                                >
                                    {showClientProjectFields ? "For Joriel's Transaction" : "For Client's Transaction"}
                                </Button>
                            )}

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

                                    <label>
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
                        </div>

                        <div className="addTransactionInputsRight">
                            <label>
                                Amount:
                                <input
                                    type="number"
                                    name="amount"
                                    value={amount}
                                    disabled={showMaterialFields ? true:false}
                                    onChange={(e) => {
                                        if (!showMaterialFields) {
                                            setAmount(e.target.value);
                                        }
                                    }}
                                />
                            </label>

                            <Button
                                variant="contained"
                                onClick={() => setShowMaterialFields(!showMaterialFields)}
                                fullWidth
                                sx={{ marginBottom: '10px' }}
                            >
                                {showMaterialFields ? "Don't Include Materials" : "Include Materials"}
                            </Button>

                            {showMaterialFields && (
                                <>
                                    <Button
                                        variant="contained"
                                        onClick={() => setOpenMaterialDialog(true)}
                                        fullWidth
                                        sx={{ marginBottom: '10px' }}
                                    >
                                        Add Material
                                    </Button>
                                    <div className="materialsTable">
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: 'linear-gradient(45deg, #66bb6a, #2e7d32)', color: '#fff' }}>
                                                    <th>Material Name</th>
                                                    <th>Price</th>
                                                    <th>Quantity</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {materials.map((material, index) => (
                                                    <tr key={index} style={{textAlign:'center'}}>
                                                        <td>{material.name}</td>
                                                        <td>{material.price}</td>
                                                        <td>{material.quantity}</td>
                                                        <td>
                                                            <Button
                                                                onClick={() => handleRemoveMaterial(index)}
                                                                variant="outlined"
                                                                color="error"
                                                            >
                                                                Remove
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            <label>
                                Transaction Category:
                                <select name="category">
                                    <option value="Operating">Operating</option>
                                    <option value="Investing">Investing</option>
                                    <option value="Financing">Financing</option>
                                </select>
                            </label>

                            <label>
                                Cash flow:
                                <select name="cashFlow">
                                    <option value="Inflow">Inflow</option>
                                    <option value="Outflow">Outflow</option>
                                </select>
                            </label>

                            <label>
                                Segment:
                                <input type="text" name="productLine" />
                            </label>
                        </div>

                        <Button variant="contained" type="submit">Submit</Button>
                    </form>
                </div>
            </Container>

            {/* Material Dialog */}
            <Dialog open={openMaterialDialog} onClose={() => setOpenMaterialDialog(false)}>
                <DialogTitle>Add Material</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Material Name"
                        value={newMaterial.name}
                        onChange={handleMaterialNameChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Material Price"
                        type="number"
                        value={newMaterial.price}
                        onChange={handleMaterialPriceChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Material Quantity"
                        type="number"
                        value={newMaterial.quantity}
                        onChange={handleMaterialQuantityChange}
                        fullWidth
                        margin="normal"
                    />
                    {error?.material && <div className="error">{error.material}</div>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenMaterialDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddMaterial} color="primary">
                        Add Material
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AddTransaction;
