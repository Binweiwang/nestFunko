import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { getSSLOptions } from './config/ssl/ssl.config'

async function bootstrap() {
  const httpsOptions = getSSLOptions()
  const app = await NestFactory.create(AppModule, { httpsOptions })
  app.setGlobalPrefix(process.env.API_VERSION || 'v1')
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.PORT || 3000)
}
bootstrap().then(() =>
  console.log(
    `🟢 Servidor escuchando en puerto: ${
      process.env.API_PORT || 3000
    } y perfil: ${process.env.NODE_ENV} 🚀`,
  ),
)
