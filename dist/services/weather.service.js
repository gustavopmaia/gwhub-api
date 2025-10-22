"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeather = void 0;
const axios_1 = __importDefault(require("axios"));
const getWeather = async (lat, long) => {
    const response = await axios_1.default.get(`https://api.weatherapi.com/v1/current.json?key=6e1543415c7c4916823230143252409&q=${lat},${long}`);
    return response.data;
};
exports.getWeather = getWeather;
