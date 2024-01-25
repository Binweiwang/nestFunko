import { Module } from '@nestjs/common'
import { PedidosService } from './pedidos.service'
import { PedidosController } from './pedidos.controller'
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose'
import { Pedido } from './schemas/pedido.schema'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@nestjs/cache-manager'
import { Usuario } from '../users/entities/user.entity'
import { PedidosMapper } from './mapper/pedidos.mapper'
import { Funko } from '../funko/entities/funko.entity'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Pedido.name,
        useFactory: () => {
          const schema = SchemaFactory.createForClass(Pedido)
          schema.plugin(mongoosePaginate)
          return schema
        },
      },
    ]),
    TypeOrmModule.forFeature([Funko]),
    CacheModule.register(),
    TypeOrmModule.forFeature([Usuario]),
  ],
  controllers: [PedidosController],
  providers: [PedidosService, PedidosMapper],
  exports: [PedidosService],
})
export class PedidosModule {}
