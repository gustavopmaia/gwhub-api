"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoordinatesFromCEP = getCoordinatesFromCEP;
const axios_1 = __importDefault(require("axios"));
async function getAddressFromCEP(cep) {
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    try {
        const response = await axios_1.default.get(url);
        return response.data;
    }
    catch (error) {
        console.error('Erro ao buscar o endereço:', error);
        return null;
    }
}
async function getLatLonFromAddress(address) {
    const street = encodeURIComponent(address.logradouro);
    const city = encodeURIComponent(address.localidade);
    const state = encodeURIComponent(address.uf);
    const country = "Brasil";
    const url = `https://nominatim.openstreetmap.org/search?street=${street}&city=${city}&state=${state}&country=${country}&format=json`;
    try {
        const response = await axios_1.default.get(url);
        if (response.data && response.data.length > 0) {
            const lat = response.data[0].lat;
            const lon = response.data[0].lon;
            return { lat, lon };
        }
        else {
            console.log("Coordenadas não encontradas para o endereço.");
            return null;
        }
    }
    catch (error) {
        console.error('Erro ao buscar coordenadas:', error);
        return null;
    }
}
async function getCoordinatesFromCEP(cep) {
    const address = await getAddressFromCEP(cep);
    if (address) {
        console.log(`Endereço encontrado: ${address.logradouro}, ${address.localidade} - ${address.uf}`);
        const coordinates = await getLatLonFromAddress(address);
        if (coordinates) {
            console.log(`Latitude: ${coordinates.lat}, Longitude: ${coordinates.lon}`);
        }
        return coordinates;
    }
    else {
        console.error('Não foi possível encontrar o endereço.');
    }
}
