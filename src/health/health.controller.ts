import { Controller, Get } from '@nestjs/common'

@Controller('api')
export class HealthController {
  @Get('healthcheck')
  health() {
    return { status: 'Healthy v2' }
  }
}

