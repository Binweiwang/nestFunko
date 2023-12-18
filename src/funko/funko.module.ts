import { Module } from '@nestjs/common'
import { FunkoService } from './funko.service'
import { FunkoController } from './funko.controller'
import { NestFunkoMapper } from './mapper/funko.nestfunkomapper'

@Module({
  controllers: [FunkoController],
  providers: [FunkoService, NestFunkoMapper],
})
export class FunkoModule {}
