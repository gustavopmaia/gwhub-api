import fastify from "fastify";
import { routes } from "./routes";
import dotenv from "dotenv";
import fastifyCron from 'fastify-cron';
import { getCoordinatesFromCEP } from "./services/cep.service.js";
import { getWeather } from "./services/weather.service.js";
import { userData } from "./services/openai.service.js";
const app = fastify({});
const PORT = 3000;
dotenv.config();
app.register(routes);
app.register(fastifyCron, {
    jobs: [
        {
            cronTime: '0 * * * *',
            onTick: async () => {
                const latLon = await getCoordinatesFromCEP(userData.usuario.cep);
                console.log(latLon);
                const weather = await getWeather(latLon.lat, latLon.lon);
                console.log(weather);
                if (weather.wind_kph > 70) {
                    console.log("Cuidado com o vento ai fera");
                }
                if (weather.precip_mm > 60) {
                    console.log("Cuidado com a chuva ai fera");
                }
                if (weather.cloud > 80) {
                    console.log("Voce vai produzir menos energia fera");
                }
            }
        }
    ]
});
app.listen({ port: PORT, host: "0.0.0.0" }, () => {
    app.cron.startAllJobs();
    console.log(`Servidor rodando na porta: ${PORT}`);
});
