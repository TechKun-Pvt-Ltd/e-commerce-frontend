import axios from 'axios';

const apiInstance = axios.create({
    baseURL: process.env.SERVER_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiInstance;