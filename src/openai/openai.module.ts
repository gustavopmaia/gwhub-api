import { Module } from '@nestjs/common'
import { OpenAiController } from './openai.controller'
import { OpenAiNestService } from './openai.service'

@Module({
  controllers: [OpenAiController],
  providers: [OpenAiNestService],
})
export class OpenAiModule {}

