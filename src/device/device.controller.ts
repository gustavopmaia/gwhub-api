import { Body, Controller, Get, Param, Post, Put, Res, UseGuards } from '@nestjs/common'
import { FastifyReply } from 'fastify'
import { DeviceService } from './device.service'
import { ApiTokenGuard } from '../common/guards/api-token.guard'
import { errorMessage, successMessage } from '../utils/messages'

@UseGuards(ApiTokenGuard)
@Controller('api/device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  async create(@Body() body: any, @Res() res: FastifyReply) {
    const result = await this.deviceService.create(body)
    if (result.ok) return res.status(201).send(successMessage('Dispositivo criado com sucesso!'))
    if (result.type === 'validation')
      return res.status(400).send(errorMessage('Erro de validação', 3, result.detail))
    return res.status(400).send(errorMessage('Erro ao criar dispositivo', 3, 'Erro'))
  }

  @Get('/turn-all')
  async turnAll() {
    await this.deviceService.updateAllOn()
  }

  @Get('/off-all')
  async turnOffAll() {
    await this.deviceService.updateAllOff()
  }

  @Get()
  async getAll(@Res() res: FastifyReply) {
    const devices = await this.deviceService.getAll()
    return res.status(200).send(devices)
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Res() res: FastifyReply) {
    const device = await this.deviceService.getOne(id)
    if (!device) return res.status(404).send(errorMessage('Dispositivo não encontrado', 2, 'Erro'))
    return res.status(200).send(device)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Res() res: FastifyReply) {
    const result = await this.deviceService.update(id, body)
    if (result.ok) return res.status(200).send(successMessage('Dispositivo atualizado com sucesso!'))
    if (result.type === 'not_found')
      return res.status(404).send(errorMessage('Dispositivo não encontrado', 2, 'Erro'))
    if (result.type === 'validation')
      return res.status(400).send(errorMessage('Erro de validação', 3, result.detail))
    return res.status(400).send(errorMessage('Erro ao atualizar dispositivo', 3, 'Erro'))
  }
}
