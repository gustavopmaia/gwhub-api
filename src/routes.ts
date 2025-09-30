import { FastifyInstance } from "fastify";
import { DeviceController } from "./controllers/device.controller";
import { OpenAiController } from "./controllers/openai.controller";
import { NotificationController } from "./controllers/notification.controller";

export const routes = async (app: FastifyInstance) => {
  app.post("/api/notification", NotificationController.addUser);

  app.post("/api/notification/send", NotificationController.sendNotification);

  app.post("/api/device", DeviceController.create);

  app.get("/api/device", DeviceController.getAll);

  app.get("/api/device/:id", DeviceController.getOne);

  app.put("/api/device/:id", DeviceController.update);

  app.post("/api/alexa", OpenAiController);

  app.get("/api/healthcheck", (req, res) => res.send({ status: "Healthy v2" }));
};
