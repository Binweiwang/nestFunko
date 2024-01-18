import { PartialType } from '@nestjs/mapped-types'
import {
  ClienteDto,
  CreatePedidoDto,
  LineasPedidoDto,
} from './create-pedido.dto'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class UpdatePedidoDto extends PartialType(CreatePedidoDto) {
  @IsNumber()
  @IsNotEmpty()
  idUsuario: number

  @IsNotEmpty()
  cliente: ClienteDto

  @IsNotEmpty()
  lineasPedido: LineasPedidoDto[]
}
