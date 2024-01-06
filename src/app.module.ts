import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { FunkoModule } from './funko/funko.module'
import { FunkoController } from './funko/funko.controller'
import { FunkoService } from './funko/funko.service'
import { FunkoMapper } from './funko/mapper/funko.nestfunkomapper'
import { CategoriasModule } from './categorias/categorias.module'
import { TypeOrmModule } from '@nestjs/typeorm'

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
