import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { PedidosService } from './pedidos.service'
import { CreatePedidoDto } from './dto/create-pedido.dto'
import { UpdatePedidoDto } from './dto/update-pedido.dto'
import { OrderByValidatePipe } from './pipes/orderby-validate.pipe'
import { OrderValidatePipe } from './pipes/order-validate.pipe'
import { IdValidatePipe } from './pipes/id-validate.pipe'
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard'
import { UsuarioExistsGuard } from './guards/usuario-exists.guard'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ApiExcludeController } from '@nestjs/swagger'

@Controller('pedidos')
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiExcludeController()
export class PedidosController {
  private readonly logger = new Logger(PedidosController.name)

  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  @Roles('ADMIN')
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
  @Roles('ADMIN')
  @HttpCode(201)
  @UseGuards(UsuarioExistsGuard)
  async create(@Body() createPedidoDto: CreatePedidoDto) {
    this.logger.log(`Creando pedido ${JSON.stringify(createPedidoDto)}`)
    return this.pedidosService.create(createPedidoDto)
  }

  @Get('usuario/:idUsuario')
  @Roles('ADMIN')
  async findByidUsuario(@Param('idUsuario', ParseIntPipe) idUsuario: number) {
    this.logger.log(`Buscando pedidos por usuario ${idUsuario}`)
    return await this.pedidosService.findByidUsuario(idUsuario)
  }

  @Get(':id')
  @Roles('ADMIN')
  @Get(':id')
  async findOne(@Param('id', IdValidatePipe) id: string) {
    this.logger.log(`Buscando pedido con id ${id}`)
    return await this.pedidosService.findOne(id)
  }

  @Put(':id')
  @UseGuards(UsuarioExistsGuard) // Aplicar el guard aquí
  @Roles('ADMIN')
  async update(
    @Param('id', IdValidatePipe) id: string,
    @Body() updatePedidoDto: UpdatePedidoDto,
  ) {
    this.logger.log(`Actualizando pedido con id ${id}`)
    return await this.pedidosService.update(id, updatePedidoDto)
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    this.logger.log(`Eliminando pedido con id ${id}`)
    await this.pedidosService.remove(id)
  }
}
