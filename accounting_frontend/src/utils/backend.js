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

export async function getCounts(setError, setCounts, company) {
  await axiosInstance.get('/get-counts', { params: { company } })
    .then(({ data }) => {
      setCounts(data);
      setError(null);
    })
    .catch(error => {
      if (error.response && error.response.status === 400) {
        const errors = error.response.data.errors;
        setError(errors);
      } else {
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

export async function filterClients(setError, setUsers, payload) {
  await axiosInstance.post('/filter-clients', payload)
    .then(({ data }) => {
      setUsers(data);
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

export async function deleteUser(setError, userID) {
  await axiosInstance.post('/delete-user', userID)
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

export async function updateClient(setError, payload) {
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

export async function generateTrendAnalysisReport(setError, setTrendAnalysisReport, payload) {
  await axiosInstance.post('/generate-trend-analysis-report', payload)
    .then(({ data }) => {
      console.log(data, "TREND ANALYSIS REPORT");
      setError(null);
      setTrendAnalysisReport(data);
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

export async function generateBalanceSheet(setError, setBalanceSheet, payload) {
  await axiosInstance.post('/generate-balance-sheet', payload)
    .then(({ data }) => {
      console.log(data, "BALANCE SHEET DATA");
      setError(null);
      setBalanceSheet(data);
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

export async function generateIncomeStatement(setError, setIncomeStatement, payload) {
  await axiosInstance.post('/generate-income-statement', payload)
    .then(({ data }) => {
      console.log(data, "INCOME STATEMENT");
      setError(null);
      setIncomeStatement(data);
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

export async function generateCashflowStatement(setError, setCashflowStatement, payload) {
  await axiosInstance.post('/generate-cashflow-statement', payload)
    .then(({ data }) => {
      console.log(data, "CASHFLOW");
      setError(null);
      setCashflowStatement(data);
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

export async function generateSegmentReport(setError, setSegmentReport, payload) {
  await axiosInstance.post('/generate-segment-report', payload)
    .then(({ data }) => {
      console.log(data, "SEGMENT REPORT");
      setError(null);
      setSegmentReport(data);
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
export async function sendForgotPasswordEmail(setError, setResponse, payload) {
  try {
    const { data } = await axiosInstance.post('/send-forgot-password-email', payload);
    setResponse(data.message); // Set the success message
    setError(null); // Clear any existing errors
    return { message: data.message }; // Return structured response
  } catch (error) {
    if (error.response && error.response.status === 400) {
      // Handle validation errors
      const errors = error.response.data.errors;
      setError(errors.message || "An error occurred"); // Use a default message
      return { error: errors.message || "An error occurred" }; // Return structured response
    } else {
      // Handle other types of errors (network error, error 500, etc.)
      console.log('An unexpected error occurred');
      setError("An unexpected error occurred");
      return { error: "An unexpected error occurred" }; // Return structured response
    }
  }
}
export async function getAllAdmins(setError, setAdmins) {
  await axiosInstance.get('/get-all-admin')
      .then(({ data }) => {
          setAdmins(data);
          setError(null);
      })
      .catch(error => {
          if (error.response && error.response.status === 400) {
              const errors = error.response.data.errors;
              setError(errors);
          } else {
              console.log('An unexpected error occurred');
          }
      });
}

export async function addNewAccess(payload, setError) {
  await axiosInstance.post('/add-new-access', payload)
      .then(({ data }) => {
          setError(null);
      })
      .catch(error => {
          if (error.response && error.response.status === 422) {
              const errors = error.response.data.errors;
              setError(errors);
          } else {
              alert('An unexpected error occurred');
          }
      });
}

export async function updateAccess(payload, setError) {
  await axiosInstance.post('/update-access', payload)
      .then(({ data }) => {
          alert(data.message);
          setError(null);
      })
      .catch(error => {
          if (error.response && error.response.status === 422) {
              const errors = error.response.data.errors;
              setError(errors);
          } else {
              alert('An unexpected error occurred');
          }
      });
}

export async function getAccess(payload, setError, setAccess) {
  await axiosInstance.get(`/get-access`, { params: payload })
      .then(({ data }) => {
          setAccess(data);
          setError(null);
      })
      .catch(error => {
          if (error.response && error.response.status === 400) {
              const errors = error.response.data.errors;
              setError(errors);
          } else {
              console.log('An unexpected error occurred');
          }
      });
}

export async function getModules(setError, setModules) {
  await axiosInstance.get('/get-modules')
      .then(({ data }) => {
        
          setModules(data);
          setError(null);
      })
      .catch(error => {
          if (error.response && error.response.status === 400) {
              const errors = error.response.data.errors;
              setError(errors);
          } else {
              console.log('An unexpected error occurred');
          }
      });
}

export async function requestAccess(payload, setError) {
  await axiosInstance.post('/request-access', payload)
      .then(({ data }) => {
          alert(data.message);
          setError(null);
      })
      .catch(error => {
          if (error.response && error.response.status === 422) {
              const errors = error.response.data.errors;
              setError(errors);
          } else {
              alert('An unexpected error occurred');
          }
      });
}

export async function getPendingAccess(setError, setPendingAccess) {
  await axiosInstance.get('/pending-request-access')
      .then(({ data }) => {
        
        setPendingAccess(data);
        setError(null);
      })
      .catch(error => {
          if (error.response && error.response.status === 400) {
              const errors = error.response.data.errors;
              setError(errors);
          } else {
              console.log('An unexpected error occurred');
          }
      });
}

export async function approvePendingAccessRequest(payload, setError,notify) {
  await axiosInstance.post('/approve-pending-access-request', payload)
      .then(({ data }) => {
notify("Successfully Approved");
          setError(null);
      })
      .catch(error => {
          if (error.response && error.response.status === 422) {
              const errors = error.response.data.errors;
              setError(errors);
          } else {
              alert('An unexpected error occurred');
          }
      });
}

export async function declinePendingAccessRequest(payload, setError, notify) {
  await axiosInstance.post('/decline-pending-access-request', payload)
      .then(({ data }) => {
        notify("Declined Request");
          setError(null);
      })
      .catch(error => {
          if (error.response && error.response.status === 422) {
              const errors = error.response.data.errors;
              setError(errors);
          } else {
              alert('An unexpected error occurred');
          }
      });
}

export async function getPendingClientRegistrationRequests(setError, setRequests) {
  await axiosInstance.get('/client-registration-requests/pending')
    .then(({ data }) => {
      setRequests(data);
      setError(null);
    })
    .catch(error => {
      if (error.response && error.response.status === 400) {
        const errors = error.response.data.errors;
        setError(errors);
      } else {
        console.log('An unexpected error occurred');
      }
    });
}


export async function respondToClientRequest(payload, setError) {
  await axiosInstance.post('/client-registration-request/respond', payload)
    .then(({ data }) => {
      setError(null);
    })
    .catch(error => {
      if (error.response && error.response.status === 422) {
        const errors = error.response.data.errors;
        setError(errors);
      } else {
        alert('An unexpected error occurred');
      }
    });
}

export async function getClientPendingTransactionRequests(setError, setPendingTransactionRequests) {
  try {
      const { data } = await axiosInstance.get(`/client-pending-transaction-requests`);
      setPendingTransactionRequests(data) // return the pending requests
  } catch (error) {
      setError(handleError(error));
  }
}

export async function getPendingTemporaryTransactionEdits(setError, setPendingTemporaryEdits) {
  try {
      const { data } = await axiosInstance.get(`/pending-temporary-transaction-edits`);
      setPendingTemporaryEdits(data);
  } catch (error) {
      setError(handleError(error));
  }
}
export async function respondToPendingTransactionRequest(payload, setError) {
  await axiosInstance.post('/transaction-request/respond', payload)
      .then(({ data }) => {
          setError(null);
      })
      .catch(error => {
          setError(handleError(error));
      });
}

export async function respondToPendingTransactionEdit(payload, setError) {
  await axiosInstance.post('/transaction-edit/respond', payload)
      .then(({ data }) => {
          setError(null);
      })
      .catch(error => {
          setError(handleError(error));
      });
}

function handleError(error) {
  if (error.response && error.response.status === 422) {
      return error.response.data.errors;
  } else {
      alert('An unexpected error occurred');
      return null;
  }
}