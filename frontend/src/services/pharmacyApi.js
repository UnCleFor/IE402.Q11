// frontend/src/services/pharmacyApi.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const fetchPharmacies = () => axios.get(`${API_BASE}/pharmacy`).then(r => r.data);
export const fetchPharmacyById = (id) => axios.get(`${API_BASE}/pharmacy/${id}`).then(r => r.data);
