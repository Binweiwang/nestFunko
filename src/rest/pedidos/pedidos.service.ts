import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Funko } from '../funko/entities/funko.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PedidosMapper } from './mapper/pedidos.mapper'
import { PaginateModel } from 'mongoose'
import { Pedido, PedidoDocument } from './schemas/pedido.schema'
import { CreatePedidoDto } from './dto/create-pedido.dto'
import { Usuario } from '../users/entities/user.entity'

export const PedidosOrderByValues: string[] = ['_id', 'idUsuario'] // Lo usamos en los pipes
export const PedidosOrderValues: string[] = ['asc', 'desc'] // Lo usam
@Injectable()
export class PedidosService {
  private logger = new Logger(PedidosService.name)

  constructor(
    @InjectModel(Pedido.name)
    private pedidosRepository: PaginateModel<PedidoDocument>,
    @InjectRepository(Funko)
    private readonly funkosRepository: Repository<Funko>,
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly pedidosMapper: PedidosMapper,
  ) {}

  async findAll(page: number, limit: number, orderBy: string, order: string) {
    this.logger.log('Buscando todos los pedidos con paginación y filtros')
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
    this.logger.log(`Buscando pedido con id ${id}`)
    const pedidoToFind = await this.pedidosRepository.findById(id).exec()
    if (!pedidoToFind) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`)
    }
    return pedidoToFind
  }

  async findByidUsuario(idUsuario: number) {
    this.logger.log(`Buscando pedido con idUsuario ${idUsuario}`)
    return await this.pedidosRepository.find({ idUsuario }).exec()
  }

  async create(createPedidoDto: CreatePedidoDto) {
    this.logger.log(`Creando pedido ${JSON.stringify(createPedidoDto)}`)
    const pedidoToBeSaved = this.pedidosMapper.toEntity(createPedidoDto)
    await this.checkPedido(pedidoToBeSaved)
    const pedidoToSave = await this.reserverStockPedidos(pedidoToBeSaved)
    pedidoToSave.createdAt = new Date()
    pedidoToSave.updatedAt = new Date()
    return await this.pedidosRepository.create(pedidoToSave)
  }

  async update(id: string, updatePedidoDto: any) {
    this.logger.log(`Actualizando pedido ${id}`)
    const pedidoToBeUpdated = await this.pedidosRepository.findById(id).exec()
    if (!pedidoToBeUpdated) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`)
    }
    const pedidoUpdated = this.pedidosMapper.toEntity(updatePedidoDto)
    await this.returnStockPedidos(pedidoToBeUpdated)
    await this.checkPedido(pedidoUpdated)
    const pedidoToSave = await this.reserverStockPedidos(pedidoUpdated)
    pedidoToSave.updatedAt = new Date()
    return await this.pedidosRepository
      .findByIdAndUpdate(id, pedidoToSave, { new: true })
      .exec()
  }

  async remove(id: string) {
    this.logger.log(`Borrando pedido ${id}`)
    const pedidoToBeDeleted = await this.pedidosRepository.findById(id).exec()
    if (!pedidoToBeDeleted) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`)
    }
    await this.returnStockPedidos(pedidoToBeDeleted)
    return await this.pedidosRepository.findByIdAndDelete(id).exec()
  }

  private async checkPedido(pedido: Pedido): Promise<void> {
    this.logger.log(`Comprobando pedido ${JSON.stringify(pedido)}`)
    if (!pedido.lineasPedido || pedido.lineasPedido.length === 0) {
      throw new Error('El pedido debe tener al menos una línea de pedido')
    }
    for (const lineaPedido of pedido.lineasPedido) {
      const funko = await this.funkosRepository.findOneBy({
        id: lineaPedido.idFunko,
      })
      if (!funko) {
        throw new BadRequestException(
          `El funko con id ${lineaPedido.idFunko} no existe`,
        )
      }
      if (lineaPedido.cantidad > funko.cantidad) {
        throw new BadRequestException(
          `No hay suficientes unidades del funko ${funko.nombre} en stock`,
        )
      }
    }
  }

  private async reserverStockPedidos(pedido: Pedido): Promise<Pedido> {
    this.logger.log(`Reservando stock del pedido ${JSON.stringify(pedido)}`)
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

  async userExists(idUsuario: number): Promise<boolean> {
    this.logger.log(`Comprobando si existe el usuario ${idUsuario}`)
    const usuario = await this.usuariosRepository.findOneBy({ id: idUsuario })
    return !!usuario
  }

  async getPedidosByUser(idUsuario: number): Promise<Pedido[]> {
    this.logger.log(`Buscando pedidos por usuario ${idUsuario}`)
    return await this.pedidosRepository.find({ idUsuario }).exec()
  }

  private async returnStockPedidos(pedido: Pedido): Promise<Pedido> {
    this.logger.log(`Retornando stock del pedido: ${pedido}`)
    if (pedido.lineasPedido) {
      for (const lineaPedido of pedido.lineasPedido) {
        const funko = await this.funkosRepository.findOneBy({
          id: lineaPedido.idFunko,
        })
        funko.cantidad += lineaPedido.cantidad
        await this.funkosRepository.save(funko)
      }
    }
    return pedido
  }
}
