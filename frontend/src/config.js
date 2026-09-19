import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

// Enable HTTP-only cookie transmission across all Axios requests
axios.defaults.withCredentials = true;

