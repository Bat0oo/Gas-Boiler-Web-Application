import axios from "axios";

const API = process.env.REACT_APP_API_URL ?? "";

export const getMapPoints = async (token?: string) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const resp = await axios.get(`${API}/api/gasboiler/map`, config);
  return resp.data; // array of { id, name, lat, lon, currentPower }
};