import { Module } from '@nestjs/common'
import { CategoriasModule } from './rest/categorias/categorias.module'
import { ConfigModule } from '@nestjs/config'
import { StorageModule } from './rest/storage/storage.module'
import { CacheModule } from '@nestjs/cache-manager'
import { DatabaseModule } from './config/database/database.module'
import { PedidosModule } from './rest/pedidos/pedidos.module'
import { FunkoModule } from './rest/funko/funko.module'
import { NotificationsModule } from './websockets/notifications.module'
import { UsersModule } from './rest/users/users.module'
import { AuthModule } from './rest/auth/auth.module'

@Module({
  imports: [
    CacheModule.register(),
    ConfigModule.forRoot(),
    DatabaseModule,
    FunkoModule,
    CategoriasModule,
    StorageModule,
    NotificationsModule,
    DatabaseModule,
    PedidosModule,
    UsersModule,
    AuthModule,
  ],
  providers: [],
})
export class AppModule {}
