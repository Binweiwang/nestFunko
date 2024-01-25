import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API REST Tienda Nestjs DAW 2023/2024')
    .setDescription(
      'API de ejemplo del curso Desarrollo de un API REST con Nestjs para 2º DAW. 2023/2024',
    )
    .setContact(
      'Binwei Wang',
      'https://github.com/Binweiwang',
      'bwang1@educa.madrid.org',
    )
    .setExternalDoc(
      'Documentación de la API',
      'https://github.com/Binweiwang/nestFunko',
    )
    .setLicense(
      'CC BY-NC-SA 4.0',
      'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    )
    .setVersion('1.0.0')
    .addTag('funkos', 'Operaciones con productos')
    .addTag('Storage', 'Operaciones con almacenamiento')
    .addTag('Auth', 'Operaciones de autenticación')
    .addBearerAuth() // Añadimos el token de autenticación
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
}
