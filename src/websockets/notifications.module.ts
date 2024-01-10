import { Module } from '@nestjs/common'
import { NotificationsFunkoGateway } from './notifications-funko/notifications-funko.gateway'
import { NotificationsCategoriaGateway } from './notifications-categoria/notifications-categoria.gateway'

@Module({
  providers: [NotificationsFunkoGateway, NotificationsCategoriaGateway],
  exports: [NotificationsFunkoGateway, NotificationsCategoriaGateway],
})
export class NotificationsModule {}
