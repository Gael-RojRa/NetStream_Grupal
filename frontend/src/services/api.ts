import axios from 'axios';

const api = axios.create({
  baseURL: 'net-stream-grupal-bcy7-11s92o3au-gael-pps-projects.vercel.app/tvdb/',
});

export default api;