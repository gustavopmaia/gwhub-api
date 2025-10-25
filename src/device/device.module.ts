import { Module } from '@nestjs/common'
import { DeviceController } from './device.controller'
import { DeviceService } from './device.service'
import { PrismaService } from '../prisma/prisma.service'
import { MqttService } from '../services/mqtt.service'

@Module({
  controllers: [DeviceController],
  providers: [DeviceService, PrismaService, MqttService],
})
export class DeviceModule {}
