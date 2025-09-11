import { OpenAiController } from "./controllers/openai.controller";
export const routes = async (app) => {
    app.post("/api/alexa", (req, res) => OpenAiController(req, res));
    app.get("/api/healthcheck", (req, res) => res.send({ status: "Healthy" }));
};
