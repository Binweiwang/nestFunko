import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { PedidosService } from './pedidos.service'
import { CreatePedidoDto } from './dto/create-pedido.dto'
import { UpdatePedidoDto } from './dto/update-pedido.dto'
import { OrderByValidatePipe } from './pipes/orderby-validate.pipe'
import { OrderValidatePipe } from './pipes/order-validate.pipe'
import { IdValidatePipe } from './pipes/id-validate.pipe'

@Controller('pedidos')
export class PedidosController {
  private readonly logger = new Logger(PedidosController.name)

  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1)) page: number = 1,
    @Query('limit', new DefaultValuePipe(20)) limit: number = 20,
    @Query('orderBy', new DefaultValuePipe('idUsuario'), OrderByValidatePipe)
    orderBy: string = 'idUsuario',
    @Query('order', new DefaultValuePipe('asc'), OrderValidatePipe)
    order: string,
  ) {
    this.logger.log(
      `Buscando todos los pedidos con: ${JSON.stringify({
        page,
        limit,
        orderBy,
        order,
      })}`,
    )
    return await this.pedidosService.findAll(page, limit, orderBy, order)
  }

  @Post()
  async create(@Body() createPedidoDto: CreatePedidoDto) {
    this.logger.log(`Creando pedido ${JSON.stringify(createPedidoDto)}`)
    return this.pedidosService.create(createPedidoDto)
  }

  @Get('usuario/:idUsuario')
  async findByIdUsuario(@Param('idUsuario', ParseIntPipe) idUsuario: number) {
    this.logger.log(`Buscando pedidos por usuario ${idUsuario}`)
    return await this.pedidosService.findByIdUsuario(idUsuario)
  }

  @Get(':id')
  async findOne(@Param('id', IdValidatePipe) id: string) {
    this.logger.log(`Buscando pedido con id ${id}`)
    return await this.pedidosService.findOne(id)
  }

  @Put(':id')
  async update(
    @Param('id', IdValidatePipe) id: string,
    @Body() updatePedidoDto: UpdatePedidoDto,
  ) {
    this.logger.log(`Actualizando pedido con id ${id}`)
    return await this.pedidosService.update(id, updatePedidoDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(`Eliminando pedido con id ${id}`)
    await this.pedidosService.remove(id)
  }
}
