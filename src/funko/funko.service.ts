import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { Funko } from './entities/funko.entity'
import { FunkoMapper } from './mapper/funko.nestfunkomapper'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Categoria } from '../categorias/entities/categoria.entity'
import { ResponseFunkoDto } from './dto/response-funko.dto'
import { StorageService } from '../storage/storage.service'
import { Request } from 'express'
import { NotificationsFunkoGateway } from '../websockets/notifications-funko/notifications-funko.gateway'
import {
  Notificacion,
  NotificacionTipo,
} from '../websockets/models/notificacion.model'

@Injectable()
export class FunkoService {
  private readonly logger: Logger = new Logger(FunkoService.name)

  constructor(
    private readonly funkoMapper: FunkoMapper,
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly storageService: StorageService,
    private readonly funkoNotificationsGateway: NotificationsFunkoGateway,
  ) {}

  async create(createFunkoDto: CreateFunkoDto) {
    this.logger.log('Crear un funko')

    const categoria = await this.checkCategoria(createFunkoDto.categoria)
    const funkoToCreate = this.funkoMapper.toFunko(createFunkoDto, categoria)
    const savedFunko = await this.funkoRepository.save(funkoToCreate)
    const dto = this.funkoMapper.funkoToResponseFunkoDto(savedFunko)
    this.onChange(NotificacionTipo.CREATE, dto)
    return dto
  }

  public async checkCategoria(nombreCategoria: string): Promise<Categoria> {
    const categoria = await this.categoriaRepository
      .createQueryBuilder()
      .where('LOWER(nombre) = LOWER(:nombre)', {
        nombre: nombreCategoria.toLowerCase(),
      })
      .getOne()

    if (!categoria) {
      throw new BadRequestException(`La categoria ${nombreCategoria} no existe`)
    }

    return categoria
  }

  async findAll() {
    this.logger.log('Buscar todos los funkos')
    return this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .getMany()
  }

  async findOne(id: number) {
    this.logger.log('Buscar un funko')
    const foundFunko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .where('funko.id = :id', { id })
      .getOne()
    if (!foundFunko) {
      throw new NotFoundException(`Funko no encontrado ${id} no existe`)
    }
    return this.funkoMapper.funkoToResponseFunkoDto(foundFunko)
  }

  async update(
    id: number,
    updateFunkoDto: UpdateFunkoDto,
  ): Promise<ResponseFunkoDto> {
    this.logger.log('Actualizar un funko')

    const funkoToUpdate = await this.findOne(id)
    let categoria: Categoria
    if (updateFunkoDto.categoria) {
      categoria = await this.checkCategoria(updateFunkoDto.categoria)
    } else {
      categoria = await this.checkCategoria(funkoToUpdate.categoria)
    }
    const funkoUpdated = await this.funkoRepository.save({
      ...funkoToUpdate,
      ...updateFunkoDto,
      categoria,
    })
    const dto = this.funkoMapper.funkoToResponseFunkoDto(funkoUpdated)
    this.onChange(NotificacionTipo.UPDATE, dto)
    return dto
  }

  async remove(id: number) {
    this.logger.log('Eliminar un funko')
    const funkoToRemove = await this.exists(id)
    const dto = this.funkoMapper.funkoToResponseFunkoDto(funkoToRemove)
    this.onChange(NotificacionTipo.DELETE, dto)
    return dto
  }

  async removeSoft(id: number) {
    this.logger.log('Eliminar un funko')
    const funkoToRemove = await this.exists(id)
    funkoToRemove.isDeleted = true
    this.funkoRepository.save(funkoToRemove)
    const dto = this.funkoMapper.funkoToResponseFunkoDto(funkoToRemove)
    this.onChange(NotificacionTipo.DELETE, dto)
    return dto
  }

  public async exists(id: number): Promise<Funko> {
    const funko = await this.funkoRepository.findOneBy({ id })
    if (!funko) {
      throw new BadRequestException(`Funko no encontrado ${id} no existe`)
    }
    return funko
  }

  public async updateImage(
    id: number,
    file: Express.Multer.File,
    req: Request,
    withUrl: boolean = true,
  ) {
    const funkoToUpdate = await this.exists(id)
    if (funkoToUpdate.imagen !== Funko.IMAGE_DEFAULT) {
      this.logger.log(`Eliminando imagen anterior ${funkoToUpdate.imagen}`)
      let imagePath = funkoToUpdate.imagen
      if (withUrl) {
        imagePath = this.storageService.getFileNameWithouUrl(
          funkoToUpdate.imagen,
        )
      }
      try {
        this.storageService.removeFile(imagePath)
      } catch (error) {
        this.logger.error(`Error al eliminar la imagen ${error}`)
      }
    }
    if (!file) {
      throw new BadRequestException(`Fichero no encontrado`)
    }
    let filePath: string

    if (withUrl) {
      this.logger.log(`Guardando imagen ${file.filename}`)
      const apiVersion = process.env.API_VERSION ? process.env.API_VERSION : ''
      filePath = `${req.protocol}://${req.get('host')}/${apiVersion}/storage/${
        file.filename
      }`
    } else {
      filePath = file.filename
    }
    funkoToUpdate.imagen = filePath
    const funkoUpdated = await this.funkoRepository.save(funkoToUpdate)
    const dto = this.funkoMapper.funkoToResponseFunkoDto(funkoUpdated)
    this.onChange(NotificacionTipo.UPDATE, dto)
    return dto
  }

  private onChange(tipo: NotificacionTipo, data: ResponseFunkoDto) {
    const notificacion = new Notificacion<ResponseFunkoDto>(
      'FUNKOS',
      tipo,
      data,
      new Date(),
    )
    this.funkoNotificationsGateway.sendMessage(notificacion)
  }
}
