import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api4.thetvdb.com/v4',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;