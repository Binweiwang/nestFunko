import { Module } from '@nestjs/common'
import { FunkoService } from './funko.service'
import { FunkoController } from './funko.controller'
import { FunkoMapper } from './mapper/funko.nestfunkomapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Funko } from './entities/funko.entity'
import { Categoria } from '../categorias/entities/categoria.entity'
import { StorageModule } from '../storage/storage.module'
import { NotificationsModule } from '../websockets/notifications.module'

@Module({
  controllers: [FunkoController],
  providers: [FunkoService, FunkoMapper],
  imports: [
    TypeOrmModule.forFeature([Funko]),
    TypeOrmModule.forFeature([Categoria]),
    StorageModule,
    NotificationsModule,
  ],
})
export class FunkoModule {}
