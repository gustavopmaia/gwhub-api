import 'reflect-metadata'
import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({})
  )

  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
  await app.listen(PORT, '0.0.0.0')
  // eslint-disable-next-line no-console
  console.log(`Servidor rodando na porta: ${PORT}`)
}

bootstrap()
