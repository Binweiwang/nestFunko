import { Module } from '@nestjs/common'
import { FunkoService } from './funko.service'
import { FunkoController } from './funko.controller'
import { FunkoMapper } from './mapper/funko.mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Funko } from './entities/funko.entity'
import { Categoria } from '../categorias/entities/categoria.entity'
import { StorageModule } from '../storage/storage.module'
import { NotificationsModule } from '../../websockets/notifications.module'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  controllers: [FunkoController],
  providers: [FunkoService, FunkoMapper],
  imports: [
    TypeOrmModule.forFeature([Funko]),
    TypeOrmModule.forFeature([Categoria]),
    StorageModule,
    NotificationsModule,
    CacheModule.register(),
  ],
})
export class FunkoModule {}
