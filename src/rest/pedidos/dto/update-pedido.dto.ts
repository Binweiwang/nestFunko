import { PartialType } from '@nestjs/mapped-types'
import {
  ClienteDto,
  CreatePedidoDto,
  LineasPedidoDto,
} from './create-pedido.dto'
import { IsNotEmpty, IsNumber, MaxLength } from 'class-validator'

export class UpdatePedidoDto extends PartialType(CreatePedidoDto) {
  @IsNumber()
  @IsNotEmpty()
  @MaxLength(10, { message: 'El idUsuario debe tener 10 dígitos' })
  idUsuario: number

  @IsNotEmpty()
  cliente: ClienteDto

  @IsNotEmpty()
  lineasPedido: LineasPedidoDto[]
}
