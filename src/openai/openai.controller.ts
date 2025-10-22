import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common'
import { FastifyReply } from 'fastify'
import { ApiTokenGuard } from '../common/guards/api-token.guard'
import z from 'zod'
import { errorMessage, successMessage } from '../utils/messages'
import { OpenAiNestService } from './openai.service'

@UseGuards(ApiTokenGuard)
@Controller('api')
export class OpenAiController {
  constructor(private readonly openai: OpenAiNestService) {}

  @Post('alexa')
  async alexa(@Body() body: any, @Res() res: FastifyReply) {
    const requestBody = z.object({ fala: z.string() })
    const validation = requestBody.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.errors.map((err) => ({ path: err.path.join('.'), message: err.message }))
      const formattedErrors = errors.map((err) => `${err.path}: ${err.message}`).join(', ')
      return res.status(400).send(errorMessage('Validation error', 1, formattedErrors))
    }

    const response = await this.openai.askAlexa(validation.data.fala)
    return res.status(200).send(successMessage(response))
  }
}
