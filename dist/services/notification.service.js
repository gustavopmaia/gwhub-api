import * as admin from "firebase-admin";
import { getCoordinatesFromCEP } from "./cep.service.js";
import { getWeather } from "./weather.service.js";
import { FIREBASE_CLIENT_EMAIL, FIREBASE_ID, FIREBASE_PRIVATE_KEY, } from "../constants.js";
export async function sendBasicNotification(users) {
    const firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
            projectId: FIREBASE_ID,
            privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            clientEmail: FIREBASE_CLIENT_EMAIL,
        }),
    });
    const location = await getCoordinatesFromCEP("01310-100");
    if (location) {
        const { lat, lon } = location;
        const data = await getWeather(lat, lon);
        const payload = {
            notification: {
                title: `Agora na FIAP Paulista está aproximadamente ${data.current.temp_c}°C`,
                body: "Com a GWHub você nunca fica no escuro!",
            },
            tokens: users,
        };
        const response = await firebaseApp
            .messaging()
            .sendEachForMulticast(payload);
        console.log({ response });
    }
}
