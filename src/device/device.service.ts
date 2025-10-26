import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { z } from 'zod'
import { MqttService } from '../services/mqtt.service'

const deviceCreateSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  isActive: z
    .union([z.literal(1), z.literal(0)])
    .refine((val: any) => val === 1 || val === 0, { message: 'isActive deve ser 1 ou 0' }),
})

// Para atualização, apenas isActive é obrigatório; name/description são opcionais
const deviceUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  isActive: z
    .union([z.literal(1), z.literal(0)])
    .refine((val: any) => val === 1 || val === 0, { message: 'isActive deve ser 1 ou 0' }),
})

const deviceSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  isActive: z
    .union([z.literal(1), z.literal(0)])
    .refine((val: any) => val === 1 || val === 0, { message: 'isActive deve ser 1 ou 0' }),
})

@Injectable()
export class DeviceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mqtt: MqttService
  ) {}

  async create(
    body: any
  ): Promise<{ ok: true } | { ok: false; type: 'validation' | 'error'; detail?: string }> {
    try {
      const parsed = deviceCreateSchema.parse(body)
      const pin = typeof body?.pin === 'number' ? body.pin : undefined
      if (pin === undefined) {
        return {
          ok: false,
          type: 'validation',
          detail: JSON.stringify([{ path: ['pin'], message: 'pin é obrigatório' }]),
        }
      }
      await this.prisma.device.create({
        data: {
          name: parsed.name,
          description: parsed.description,
          pin,
          isActive: parsed.isActive === 1,
        },
      })
      return { ok: true }
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return { ok: false, type: 'validation', detail: JSON.stringify(e.errors) }
      }
      return { ok: false, type: 'error' }
    }
  }

  async getAll() {
    return this.prisma.device.findMany()
  }

  async getOne(id: string) {
    return this.prisma.device.findUnique({ where: { id } })
  }

  async updateAllOn() {
    await this.prisma.device.updateMany({
      data: {
        isActive: true,
      },
    })

    for (let i = 1; i <= 6; i++) {
      const message = `LED${i}:ON`
      await this.mqtt.publishMessage(message)
    }
  }

  async updateAllOff() {
    await this.prisma.device.updateMany({
      data: {
        isActive: false,
      },
    })

    for (let i = 1; i <= 6; i++) {
      const message = `LED${i}:OFF`
      await this.mqtt.publishMessage(message)
    }
  }

  async update(
    id: string,
    body: any
  ): Promise<{ ok: true } | { ok: false; type: 'validation' | 'not_found' | 'error'; detail?: string }> {
    try {
      const parsed = deviceUpdateSchema.parse(body)
      const exists = await this.prisma.device.findUnique({ where: { id } })
      if (!exists) return { ok: false, type: 'not_found' }
      const newIsActive = parsed.isActive === 1 ? true : parsed.isActive === 0 ? false : false
      await this.prisma.device.update({
        where: { id },
        data: {
          ...(parsed.name ? { name: parsed.name } : {}),
          ...(parsed.description ? { description: parsed.description } : {}),
          isActive: newIsActive,
        },
      })

      if (exists.isActive !== newIsActive) {
        const pin = exists.pin
        const message = `LED${pin}:${newIsActive ? 'ON' : 'OFF'}`
        await this.mqtt.publishMessage(message)
      }
      return { ok: true }
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return { ok: false, type: 'validation', detail: JSON.stringify(e.errors) }
      }
      return { ok: false, type: 'error' }
    }
  }
}
