import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { ResponseFunkoDto } from '../../rest/funko/dto/response-funko.dto'
import { Notificacion } from '../models/notificacion.model'

const ENDPOINT: string = `/ws/${process.env.API_VERSION || 'v1'}/funkos`

@WebSocketGateway({
  namespace: ENDPOINT,
})
export class NotificationsFunkoGateway {
  @WebSocketServer()
  private server: Server
  private readonly logger = new Logger(NotificationsFunkoGateway.name)

  constructor() {
    this.logger.log(`NotificationsFunkoGateway está escuchando en: ${ENDPOINT}`)
  }

  sendMessage(notification: Notificacion<ResponseFunkoDto>) {
    this.server.emit('updates', notification)
  }

  private handleConnection(client: Socket) {
    this.logger.debug('Cliente conectado:', client.id)
    this.server.emit(
      'connection',
      'Conexión a WS: Funkos - Tienda Funko NestJS',
    )
  }

  private handleDisconnect(client: Socket) {
    console.log('Cliente desconectado:', client.id)
    this.logger.debug('Cliente desconectado:', client.id)
  }
}
