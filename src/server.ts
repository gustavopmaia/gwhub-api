import fastify from "fastify";
import { routes } from "./routes";

const app = fastify({});
const PORT = 3000;

app.register(routes);

app.listen({ port: PORT }, () => {
  console.log(`Servidor rodando na porta: ${PORT}`);
});
