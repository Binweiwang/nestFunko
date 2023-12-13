import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { FunkoModule } from './funko/funko.module'
import { FunkoController } from './funko/funko.controller'
import { FunkoService } from './funko/funko.service'

@Module({
  imports: [ConfigModule.forRoot(), FunkoModule],
  controllers: [FunkoController],
  providers: [FunkoService],
})
export class AppModule {}
