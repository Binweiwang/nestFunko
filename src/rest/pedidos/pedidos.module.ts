import { Module } from '@nestjs/common'
import { PedidosService } from './pedidos.service'
import { PedidosController } from './pedidos.controller'
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@nestjs/cache-manager'
import { Funko } from '../funko/entities/funko.entity'
import { Pedido } from './schemas/pedido.schema'

function mongoosePaginate() {}

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
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}
