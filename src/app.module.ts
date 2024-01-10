import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { FunkoModule } from './funko/funko.module'
import { CategoriasModule } from './categorias/categorias.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StorageModule } from './storage/storage.module'
import { NotificationsModule } from './websockets/notifications.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    FunkoModule,
    CategoriasModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin',
      database: 'funkos',
      entities: [`${__dirname}` + `/**/*.entity{.ts,.js}`],
      synchronize: true,
    }),
    StorageModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
