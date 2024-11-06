import React, { useState, useEffect } from 'react';
import { Box, Container, Button, TextField, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Dialog, DialogActions, DialogContent, DialogTitle, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { addProject, getApprovedProjects, updateProjectStatus, getPendingProjects, getClients } from '../utils/backend';
import { useStateContext } from '../context/ContextProvider';
import '../css/manageProject.css';

const ManageProject = () => {
  const [projects, setProjects] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [error, setError] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState([]);
  
  const [approvedProjectsPage, setApprovedProjectsPage] = useState(0); // Separate page state for approved projects
  const [pendingProjectsPage, setPendingProjectsPage] = useState(0); // Separate page state for pending projects
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { user } = useStateContext();
  const theme = useTheme();

  useEffect(() => {
    const fetchApprovedProjects = async () => {
      await getApprovedProjects({ clientID: user.userType === 'client' ? user.id : null }, setError, setProjects);
    };
    fetchApprovedProjects();
  }, [user.id]);

  useEffect(() => {
    const fetchPendingProjects = async () => {
      await getPendingProjects(setError, setPendingProjects);
    };
    fetchPendingProjects();
  }, []);

  useEffect(() => {
    if (user.userType === 'admin' || user.userType === 'superadmin') {
      const fetchClients = async () => {
        await getClients(setError, setClients);
      };
      fetchClients();
    }
  }, [user.userType]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredProjects = projects.filter(project =>
    project.projectName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddProject = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmitProject = async (event) => {
    const payload = {
      projectName: newProjectName,
      clientID: user.userType === 'client' ? user.id : selectedClient, 
      status: user.userType === 'client' ? 'Pending' : 'Approved',
    };
    
    await addProject(payload, setError, event);
    if(user.userType !== 'client'){
      location.reload();
    }

    if (!error) {
      setNewProjectName('');
      handleCloseDialog();
    }
  };

  const handleChangeApprovedProjectsPage = (event, newPage) => {
    setApprovedProjectsPage(newPage);
  };

  const handleChangePendingProjectsPage = (event, newPage) => {
    setPendingProjectsPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setApprovedProjectsPage(0);
    setPendingProjectsPage(0);
  };

  const handleProjectStatusChange = async (projectID, clientID, status) => {
    const payload = {
      status,
      clientID,
      projectID
    };
    await updateProjectStatus(payload, setError);
    location.reload();
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', margin: "auto", paddingTop: 4 }}>
      <Container maxWidth="lg" className="history-container" sx={{marginBottom:10}}>
        <Grid container justifyContent="center" spacing={2}>
          {/* Search Input */}
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              fullWidth
              label="Search Project"
              variant="outlined"
              value={search}
              onChange={handleSearchChange}
              sx={{ backgroundColor: theme.palette.common.white, borderRadius: 1, paddingRight: 1, height: '56px' }}
            />
          </Grid>

          {/* Add Project Button */}
          <Grid item>
            <Button 
              variant="contained" 
              onClick={handleAddProject}
              sx={{ backgroundColor: '#0c6c2f', height: '56px', width: '100%' }}
            >
              Add New Project
            </Button>
          </Grid>
          
          {/* Pending Projects Table */}
          {user.userType !== 'client' && <Grid item xs={12}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>Pending Projects</Typography>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="pending projects table">
                <TableHead sx={{background:'#0c6c2f'}}>
                  <TableRow>
                    <TableCell sx={{color:'white',fontWeight:'bold'}}>CLIENT NAME</TableCell>
                    <TableCell sx={{color:'white',fontWeight:'bold'}}>PROJECT NAME</TableCell>
                    <TableCell sx={{color:'white',fontWeight:'bold'}}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">Currently No Pending Projects</TableCell>
                    </TableRow>
                  ) : (
                    pendingProjects.slice(pendingProjectsPage * rowsPerPage, pendingProjectsPage * rowsPerPage + rowsPerPage).map((project) => (
                      <TableRow key={project.project_id}>
                        <TableCell>{project.client_name}</TableCell>
                        <TableCell>{project.projectName}</TableCell>
                        <TableCell>
                          <Button variant="contained" sx={{marginRight:1}} color="success" onClick={() => handleProjectStatusChange(project.project_id, project.clientID, 'Approved')}>Approve</Button>
                          <Button variant="contained" color="error" onClick={() => handleProjectStatusChange(project.project_id, project.clientID, 'Declined')}>Decline</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={pendingProjects.length}
              rowsPerPage={rowsPerPage}
              page={pendingProjectsPage}
              onPageChange={handleChangePendingProjectsPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Grid>}

          {/* Approved Projects Table */}
          <Grid item xs={12} sx={{ marginTop: 4 }}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>Approved Projects</Typography>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="approved projects table">
                <TableHead sx={{background:'#0c6c2f'}}>
                  <TableRow>
                    <TableCell sx={{color:'white',fontWeight:'bold'}}>PROJECT NAME</TableCell>
                    {user.userType !== 'client' &&<TableCell sx={{color:'white',fontWeight:'bold'}}>CLIENT NAME</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={1} align="center">Currently No Approved Projects</TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.slice(approvedProjectsPage * rowsPerPage, approvedProjectsPage * rowsPerPage + rowsPerPage).map((project) => (
                      <TableRow key={project.project_id}>
                        <TableCell>{project.projectName}</TableCell>
                        {user.userType !== 'client' &&<TableCell>{project.client_name}</TableCell>}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredProjects.length}
              rowsPerPage={rowsPerPage}
              page={approvedProjectsPage}
              onPageChange={handleChangeApprovedProjectsPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Add Project Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            sx={{ height: '56px' }}
          />

          {/* Select Client (only for admin/superadmin) */}
          {(user.userType === 'admin' || user.userType === 'superadmin') && (
            <FormControl fullWidth sx={{ marginTop: 2 }}>
              <InputLabel>Client</InputLabel>
              <Select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                label="Client"
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {error && error.projectName && error.projectName.map((errorMessage, index) => (
            <Typography key={index}><span className='addUserErrorText'>{errorMessage}</span></Typography>
          ))}
          {error && error.clientID && error.clientID.map((errorMessage, index) => (
            <Typography key={index}><span className='addUserErrorText'>{errorMessage}</span></Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
          <Button onClick={handleSubmitProject} color="primary">Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageProject;
