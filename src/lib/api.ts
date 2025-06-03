// lib/api.ts

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:6969/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // if you're using cookies/auth
});

export default api;
