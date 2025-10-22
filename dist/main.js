"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv/config");
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({}));
    const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(PORT, '0.0.0.0');
    // eslint-disable-next-line no-console
    console.log(`Servidor rodando na porta: ${PORT}`);
}
bootstrap();
