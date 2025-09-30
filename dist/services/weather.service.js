import axios from 'axios';
export const getWeather = async (lat, long) => {
    const response = await axios.get(`https://api.weatherapi.com/v1/current.json?key=6e1543415c7c4916823230143252409&q=${lat},${long}`);
    return response.data;
};
