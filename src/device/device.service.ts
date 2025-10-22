import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { z } from 'zod'

const deviceSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  isActive: z
    .union([z.literal(1), z.literal(0)])
    .refine((val: any) => val === 1 || val === 0, { message: 'isActive deve ser 1 ou 0' }),
})

@Injectable()
export class DeviceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: any): Promise<{ ok: true } | { ok: false; type: 'validation' | 'error'; detail?: string }> {
    try {
      const parsed = deviceSchema.parse(body)
      await this.prisma.device.create({
        data: {
          name: parsed.name,
          description: parsed.description,
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

  async update(
    id: string,
    body: any
  ): Promise<{ ok: true } | { ok: false; type: 'validation' | 'not_found' | 'error'; detail?: string }> {
    try {
      const parsed = deviceSchema.parse(body)
      const exists = await this.prisma.device.findUnique({ where: { id } })
      if (!exists) return { ok: false, type: 'not_found' }
      await this.prisma.device.update({
        where: { id },
        data: {
          name: parsed.name,
          description: parsed.description,
          isActive: parsed.isActive === 1 ? true : parsed.isActive === 0 ? false : false,
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
}

