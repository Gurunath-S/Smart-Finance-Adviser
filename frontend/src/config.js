import axios from 'axios';

let rawApiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
if (!rawApiUrl.endsWith('/api') && !rawApiUrl.endsWith('/api/')) {
  rawApiUrl = rawApiUrl.replace(/\/+$/, '') + '/api';
}
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "896635394546-rjbo3k9a7fl1ugqbjr4orbuk9gphidk0.apps.googleusercontent.com";

// Enable HTTP-only cookie transmission across all Axios requests
axios.defaults.withCredentials = true;

