import { FastifyInstance } from "fastify";
import { DeviceController } from "./controllers/device.controller";

export const routes = async (app: FastifyInstance) => {
  app.post("/api/device", DeviceController.create);

  app.get("/api/device", DeviceController.getAll);

  app.get("/api/device/:id", DeviceController.getOne);

  app.put("/api/device/:id", DeviceController.update);

  app.get("/api/healthcheck", (req, res) => res.send({ status: "Healthy v2" }));
};
