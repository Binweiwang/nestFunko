import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Funko } from '../funko/entities/funko.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PedidosMapper } from './mapper/pedidos.mapper'
import { PaginateModel } from 'mongoose'
import { Pedido, PedidoDocument } from './schemas/pedido.schema'
import { CreatePedidoDto } from './dto/create-pedido.dto'

@Injectable()
export class PedidosService {
  private loogger = new Logger(PedidosService.name)

  constructor(
    @InjectModel(Pedido.name)
    private pedidosRepository: PaginateModel<PedidoDocument>,
    @InjectRepository(Funko)
    private readonly funkosRepository: Repository<Funko>,
    private readonly pedidosMapper: PedidosMapper,
  ) {}

  async findAll(page: number, limit: number, orderBy: string, order: string) {
    this.loogger.log('Buscando todos los pedidos con paginación y filtros')
    const options = {
      page,
      limit,
      sort: {
        [orderBy]: order,
      },
      collection: 'es_ES',
    }
    return await this.pedidosRepository.paginate({}, options)
  }

  async findOne(id: string) {
    this.loogger.log(`Buscando pedido con id ${id}`)
    const pedidoToFind = await this.pedidosRepository.findById(id).exec()
    if (!pedidoToFind) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`)
    }
    return pedidoToFind
  }

  async findByIdUsuario(idUsuario: number) {
    this.loogger.log(`Buscando pedido con idUsuario ${idUsuario}`)
    return await this.pedidosRepository.find({ idUsuario }).exec()
  }

  async create(createPedidoDto: CreatePedidoDto) {
    this.loogger.log(`Creando pedido ${JSON.stringify(createPedidoDto)}`)
    const pedidoToBeSaved = this.pedidosMapper.toEntity(createPedidoDto)
    await this.checkPedido(pedidoToBeSaved)
    const pedidoToSave = await this.reserverStockPedidos(pedidoToBeSaved)
    return await this.pedidosRepository.create(pedidoToBeSaved)
  }

  private async checkPedido(pedido: Pedido): Promise<void> {
    this.loogger.log(`Comprobando pedido ${JSON.stringify(pedido)}`)
    if (!pedido.lineasPedido || pedido.lineasPedido.length === 0) {
      throw new Error('El pedido debe tener al menos una línea de pedido')
    }
    for (const lineaPedido of pedido.lineasPedido) {
      const funko = await this.funkosRepository.findOneBy({
        id: lineaPedido.idFunko,
      })
      if (!funko) {
        throw new Error(`El funko con id ${lineaPedido.idFunko} no existe`)
      }
      if (lineaPedido.cantidad > funko.cantidad) {
        throw new Error(
          `No hay suficientes unidades del funko ${funko.nombre} en stock`,
        )
      }
    }
  }

  private async reserverStockPedidos(pedido: Pedido): Promise<Pedido> {
    this.loogger.log(`Reservando stock del pedido ${JSON.stringify(pedido)}`)
    if (!pedido.lineasPedido || pedido.lineasPedido.length === 0) {
      throw new Error('El pedido debe tener al menos una línea de pedido')
    }
    for (const lineaPedido of pedido.lineasPedido) {
      const funko = await this.funkosRepository.findOneBy({
        id: lineaPedido.idFunko,
      })
      funko.cantidad -= lineaPedido.cantidad
      await this.funkosRepository.save(funko)
      lineaPedido.total = lineaPedido.cantidad * lineaPedido.precioFunko
    }
    pedido.total = pedido.lineasPedido.reduce(
      (total, lineaPedido) => total + lineaPedido.total,
      0,
    )
    pedido.totalItems = pedido.lineasPedido.reduce(
      (total, lineaPedido) => total + lineaPedido.cantidad,
      0,
    )
    return pedido
  }
}
