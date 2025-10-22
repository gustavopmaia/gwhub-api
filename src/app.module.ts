import { Module } from '@nestjs/common'
import { DeviceModule } from './device/device.module'
import { OpenAiModule } from './openai/openai.module'
import { HealthModule } from './health/health.module'
import { PrismaService } from './prisma/prisma.service'

@Module({
  imports: [DeviceModule, OpenAiModule, HealthModule],
  providers: [PrismaService],
})
export class AppModule {}

