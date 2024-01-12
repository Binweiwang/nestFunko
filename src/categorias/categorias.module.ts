import { Module } from '@nestjs/common'
import { CategoriasService } from './categorias.service'
import { CategoriasController } from './categorias.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Categoria } from './entities/categoria.entity'
import { CategoriasMapper } from './mapper/categorias.mapper'
import { NotificationsModule } from '../websockets/notifications.module'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  // Importamos el servicio de categorias de TypeORM
  imports: [
    TypeOrmModule.forFeature([Categoria]),
    NotificationsModule,
    CacheModule.register(),
  ],
  controllers: [CategoriasController],
  providers: [CategoriasService, CategoriasMapper],
  exports: [],
})
export class CategoriasModule {}
