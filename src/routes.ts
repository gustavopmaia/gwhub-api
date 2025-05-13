import { FastifyInstance } from "fastify";
import { OpenAiController } from "./controllers/openai.controller";

export const routes = async (app: FastifyInstance) => {
  app.post("/api/alexa", (req, res) => OpenAiController(req, res));
};
