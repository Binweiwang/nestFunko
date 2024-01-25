import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { getSSLOptions } from './config/ssl/ssl.config'
import { setupSwagger } from './config/swagger/swagger.config'
import * as process from 'process'
async function bootstrap() {
  if (process.env.NODE_ENV === 'dev') {
    console.log(`🛠️
.___       .__       .__                   .___      
|   | ____ |__| ____ |__|____    ____    __| _/____  
|   |/    \\|  |/ ___\\|  \\__  \\  /    \\  / __ |/  _ \\ 
|   |   |  \\  \\  \\___|  |/ __ \\|   |  \\/ /_/ (  <_> )
|___|___|  /__|\\___  >__(____  /___|  /\\____ |\\____/ 
         \\/        \\/        \\/     \\/      \\/       
   _____             .___      
  /     \\   ____   __| _/____  
 /  \\ /  \\ /  _ \\ / __ |/  _ \\ 
/    Y    (  <_> ) /_/ (  <_> )
\\____|__  /\\____/\\____ |\\____/ 
        \\/            \\/       
    .___                                        .__  .__          
  __| _/____   ___________ ______________  ____ |  | |  |   ____  
 / __ |/ __ \\ /  ___/\\__  \\\\_  __ \\_  __ \\/  _ \\|  | |  |  /  _ \\ 
/ /_/ \\  ___/ \\___ \\  / __ \\|  | \\/|  | \\(  <_> )  |_|  |_(  <_> )
\\____ |\\___  >____  >(____  /__|   |__|   \\____/|____/____/\\____/ `)
  } else {
    console.log(`🚗
.___       .__       .__                   .___      
|   | ____ |__| ____ |__|____    ____    __| _/____  
|   |/    \\|  |/ ___\\|  \\__  \\  /    \\  / __ |/  _ \\ 
|   |   |  \\  \\  \\___|  |/ __ \\|   |  \\/ /_/ (  <_> )
|___|___|  /__|\\___  >__(____  /___|  /\\____ |\\____/ 
         \\/        \\/        \\/     \\/      \\/       
   _____             .___      
  /     \\   ____   __| _/____  
 /  \\ /  \\ /  _ \\ / __ |/  _ \\ 
/    Y    (  <_> ) /_/ (  <_> )
\\____|__  /\\____/\\____ |\\____/ 
        \\/            \\/       
                        .___                  .__               
_____________  ____   __| _/_ __   ____  ____ |__| ____   ____  
\\____ \\_  __ \\/  _ \\ / __ |  |  \\_/ ___\\/ ___\\|  |/  _ \\ /    \\ 
|  |_> >  | \\(  <_> ) /_/ |  |  /\\  \\__\\  \\___|  (  <_> )   |  \\
|   __/|__|   \\____/\\____ |____/  \\___  >___  >__|\\____/|___|  /
|__|                     \\/           \\/    \\/               \\/ `)
  }
  const httpsOptions = getSSLOptions()
  const app = await NestFactory.create(AppModule, { httpsOptions })
  app.setGlobalPrefix(process.env.API_VERSION || 'v1')
  if (process.env.NODE_ENV === 'dev') {
    setupSwagger(app)
  }
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
