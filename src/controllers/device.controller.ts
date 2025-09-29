import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { errorMessage, successMessage } from '../utils/messages'
import { z } from 'zod'

const prisma = new PrismaClient()

const deviceSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  isActive: z
    .union([z.literal(1), z.literal(0)])
    .refine((val: any) => val === 1 || val === 0, { message: 'isActive deve ser 1 ou 0' }),
})

export const DeviceController = {
  create: async (req: FastifyRequest, res: FastifyReply) => {
    const token = req.headers['authorization']

    if (token !== '8673c8bfb68df6c834cb8f1ec5c2bb367418390b7e675c9d71d2f5281d6a1e4c') {
      return res.status(401).send(errorMessage('Authorization error', 2))
      z
    }

    try {
      const parsedBody = deviceSchema.parse(req.body)

      const newDevice = await prisma.device.create({
        data: {
          name: parsedBody.name,
          description: parsedBody.description,
          isActive: parsedBody.isActive === 1 ? true : false,
        },
      })

      res.status(201).send(successMessage('Dispositivo criado com sucesso!'))
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).send(errorMessage('Erro de validação', 3, JSON.stringify(e.errors)))
      }

      res.status(400).send(errorMessage('Erro ao criar dispositivo', 3, 'Erro'))
    }
  },

  getAll: async (req: FastifyRequest, res: FastifyReply) => {
    const token = req.headers['authorization']

    if (token !== '8673c8bfb68df6c834cb8f1ec5c2bb367418390b7e675c9d71d2f5281d6a1e4c') {
      return res.status(401).send(errorMessage('Authorization error', 2))
      z
    }
    try {
      const devices = await prisma.device.findMany()
      res.status(200).send(devices)
    } catch (e) {
      res.status(400).send(errorMessage('Erro ao obter dispositivos', 3, 'Erro'))
    }
  },

  getOne: async (req: FastifyRequest, res: FastifyReply) => {
    const token = req.headers['authorization']

    if (token !== '8673c8bfb68df6c834cb8f1ec5c2bb367418390b7e675c9d71d2f5281d6a1e4c') {
      return res.status(401).send(errorMessage('Authorization error', 2))
      z
    }
    const { id } = req.params as { id: string }

    try {
      const device = await prisma.device.findUnique({
        where: { id: id },
      })

      if (!device) {
        return res.status(404).send(errorMessage('Dispositivo não encontrado', 2, 'Erro'))
      }

      res.status(200).send(device)
    } catch (e) {
      console.log(e)
      res.status(400).send(errorMessage('Erro ao obter dispositivo', 3, 'Erro'))
    }
  },

  update: async (req: FastifyRequest, res: FastifyReply) => {
    const token = req.headers['authorization']

    if (token !== '8673c8bfb68df6c834cb8f1ec5c2bb367418390b7e675c9d71d2f5281d6a1e4c') {
      return res.status(401).send(errorMessage('Authorization error', 2))
      z
    }

    const { id } = req.params as { id: string }

    try {
      const parsedBody = deviceSchema.parse(req.body)

      const device = await prisma.device.findUnique({
        where: { id: id },
      })

      if (!device) {
        return res.status(404).send(errorMessage('Dispositivo não encontrado', 2, 'Erro'))
      }

      const updatedDevice = await prisma.device.update({
        where: { id: id },
        data: {
          name: parsedBody.name,
          description: parsedBody.description,
          isActive: parsedBody.isActive === 1 ? true : parsedBody.isActive === 0 ? false : false,
        },
      })

      res.status(200).send(successMessage('Dispositivo atualizado com sucesso!'))
    } catch (e) {
      console.log(e)
      if (e instanceof z.ZodError) {
        return res.status(400).send(errorMessage('Erro de validação', 3, JSON.stringify(e.errors)))
      }

      res.status(400).send(errorMessage('Erro ao atualizar dispositivo', 3, 'Erro'))
    }
  },
}
