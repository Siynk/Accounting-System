import axios from 'axios';
let axiosInstance = axios.create({
        baseURL: 'http://localhost:8000/api',
});

axiosInstance.interceptors.request.use((config) => {
        let token = localStorage.getItem('ACCESS_TOKEN');
        config.headers.Authorization = `Bearer ${token}`;
        return config;
});

axiosInstance.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
                try{
                        let { response } = error;
                        if (response && response.status === 401) {
                            localStorage.removeItem('ACCESS_TOKEN');
                        }
                }catch(error){
                        console.error(error);
                }
            
            throw error; 
        }
    );
    

export default axiosInstance;