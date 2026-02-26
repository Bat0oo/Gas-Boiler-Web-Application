import axios from "axios";

const API = process.env.REACT_APP_API_URL ?? "";

export const getWeatherByCoords = async (lat: number, lon: number) => {
  const url = `${API}/api/weather/by-coordinates?lat=${lat}&lon=${lon}`;
  const resp = await axios.get(url, { withCredentials: true });
  return resp.data;
};
