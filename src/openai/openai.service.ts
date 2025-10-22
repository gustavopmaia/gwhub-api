import { Injectable } from '@nestjs/common'
import { OpenAiService as RawOpenAiService } from '../services/openai.service'

@Injectable()
export class OpenAiNestService {
  async askAlexa(fala: string) {
    return RawOpenAiService(fala)
  }
}

