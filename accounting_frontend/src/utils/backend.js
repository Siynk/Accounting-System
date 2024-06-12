import axiosInstance from "./axiosInstance";

export function login(payload, setError, setUser, setToken) {
    axiosInstance.post('/login', payload)
        .then(({ data }) => {
            //console.log(data.user);
            setUser(data.user);
            setToken(data.token);
            // Clear any existing error messages
            setError(null);
        })
        .catch(error => {
            const response = error.response;
            if (response && response.status === 401) {
                // Update state with the error message
                setError(response.data.message);
            } else {
                // Handle other types of errors (e.g., network errors)
                setError('An unexpected error occurred. Please try again later.');
            }
        });
}

export function getLoggedInUser(setUser){
    axiosInstance.get('/user').then(({ data }) => {
        setUser(data);
    });
}

export function logout(setUser,setToken){
    axiosInstance.get('/logout').then(({ }) => {
        setUser(null);
        setToken(null);
    });
}

export async function updateUser(payload, setError, setIsEdit) {
    await axiosInstance.post('/update-user', payload)
      .then(({ data }) => {
        alert(data.message);
        setError(null);
        setIsEdit(false);
      })
      .catch(error => {
        if (error.response && error.response.status === 422) {
          // Assuming the backend sends the errors as an object with keys as field names
          const errors = error.response.data.errors;
          setError(errors);
          setIsEdit(true);
        } else {
          // Handle other types of errors (network error, error 500, etc.)
          alert('An unexpected error occurred');
        }
      });
}

export async function addUser(payload, setError, event) {
    await axiosInstance.post('/add-user', payload)
      .then(({ data }) => {
        alert(data.message);
        event.target.reset();
        setError(null);
      })
      .catch(error => {
        if (error.response && error.response.status === 422) {
          // Assuming the backend sends the errors as an object with keys as field names
          const errors = error.response.data.errors;
          setError(errors);
        } else {
          // Handle other types of errors (network error, error 500, etc.)
          alert('An unexpected error occurred');
        }
      });
}

export async function addTransaction(payload, setError, event) {
  await axiosInstance.post('/add-transaction', payload)
    .then(({ data }) => {
      alert(data.message);
      event.target.reset();
      setError(null);
    })
    .catch(error => {
      if (error.response && error.response.status === 422) {
        // Assuming the backend sends the errors as an object with keys as field names
        const errors = error.response.data.errors;
        setError(errors);
      } else {
        // Handle other types of errors (network error, error 500, etc.)
        alert('An unexpected error occurred');
      }
    });
}

export async function getAllTransactions(setError, setAllTransactions) {
  await axiosInstance.get('/get-all-transactions')
    .then(({ data }) => {
      setAllTransactions(data);
      setError(null);
    })
    .catch(error => {
      if (error.response && error.response.status === 400) {
        // Assuming the backend sends the errors as an object with keys as field names
        const errors = error.response.data.errors;
        setError(errors);
      } else {
        // Handle other types of errors (network error, error 500, etc.)
        console.log('An unexpected error occurred');
      }
    });
}

export async function getCounts(setError, setCounts) {
  await axiosInstance.get('/get-counts')
    .then(({ data }) => {
      setCounts(data);
      setError(null);
    })
    .catch(error => {
      if (error.response && error.response.status === 400) {
        // Assuming the backend sends the errors as an object with keys as field names
        const errors = error.response.data.errors;
        setError(errors);
      } else {
        // Handle other types of errors (network error, error 500, etc.)
        console.log('An unexpected error occurred');
      }
    });
}

export async function getClients(setError, setClients) {
  await axiosInstance.get('/get-all-clients')
    .then(({ data }) => {
      setClients(data);
      setError(null);
    })
    .catch(error => {
      if (error.response && error.response.status === 400) {
        // Assuming the backend sends the errors as an object with keys as field names
        const errors = error.response.data.errors;
        setError(errors);
      } else {
        // Handle other types of errors (network error, error 500, etc.)
        console.log('An unexpected error occurred');
      }
    });
}

export async function filterTransactions(setError, setTransactions, payload) {
  await axiosInstance.post('/filter-transactions', payload)
    .then(({ data }) => {
      setTransactions(data);
      setError(null);
    })
    .catch(error => {
      if (error.response && error.response.status === 400) {
        // Assuming the backend sends the errors as an object with keys as field names
        const errors = error.response.data.errors;
        setError(errors);
      } else {
        // Handle other types of errors (network error, error 500, etc.)
        console.log('An unexpected error occurred');
      }
    });
}

export async function updateTransaction(setError, payload) {
  await axiosInstance.post('/update-transaction', payload)
    .then(({ data }) => {
      console.log(data.message);
      setError(null);
    })
    .catch(error => {
      if (error.response && error.response.status === 422) {
        // Assuming the backend sends the errors as an object with keys as field names
        const errors = error.response.data.errors;
        setError(errors);
      } else {
        // Handle other types of errors (network error, error 500, etc.)
        alert('An unexpected error occurred');
      }
    });
}
export async function deleteTransaction(setError, transactionID) {
  await axiosInstance.post('/delete-transaction', transactionID)
    .then(({ data }) => {
      alert(data.message);
      setError(null);
    })
    .catch(error => {
      if (error.response && error.response.status === 422) {
        // Assuming the backend sends the errors as an object with keys as field names
        const errors = error.response.data.errors;
        setError(errors);
      } else {
        // Handle other types of errors (network error, error 500, etc.)
        alert('An unexpected error occurred');
      }
    });
}

export async function registerClient(payload, setError, event) {
  
  await axiosInstance.post('/register-client', payload)
    .then(({ data }) => {
      alert(data.message);
      event.target.reset();
      setError(null);
    })
    .catch(error => {
      if (error.response && error.response.status === 422) {
        // Assuming the backend sends the errors as an object with keys as field names
        const errors = error.response.data.errors;
        setError(errors);
      } else {
        // Handle other types of errors (network error, error 500, etc.)
        alert('An unexpected error occurred');
      }
    });
}
