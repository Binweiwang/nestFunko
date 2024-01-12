import {
  BadRequestException,
  Inject,
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
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'

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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createFunkoDto: CreateFunkoDto) {
    this.logger.log('Crear un funko')

    const categoria = await this.checkCategoria(createFunkoDto.categoria)
    const funkoToCreate = this.funkoMapper.toFunko(createFunkoDto, categoria)
    const savedFunko = await this.funkoRepository.save(funkoToCreate)
    const dto = this.funkoMapper.funkoToResponseFunkoDto(savedFunko)
    this.onChange(NotificacionTipo.CREATE, dto)
    await this.invalidateCacheKey('funkos')
    return dto
  }

  public async checkCategoria(nombreCategoria: string): Promise<Categoria> {
    const cache: Categoria = await this.cacheManager.get(
      `categoria-${nombreCategoria}`,
    )
    if (cache) {
      return cache
    }
    const categoria = await this.categoriaRepository
      .createQueryBuilder()
      .where('LOWER(nombre) = LOWER(:nombre)', {
        nombre: nombreCategoria.toLowerCase(),
      })
      .getOne()

    if (!categoria) {
      throw new BadRequestException(`La categoria ${nombreCategoria} no existe`)
    }
    await this.cacheManager.set(`categoria-${nombreCategoria}`, categoria, 60)
    return categoria
  }

  async findAll(query: PaginateQuery) {
    this.logger.log('Buscar todos los funkos')
    const cache = await this.cacheManager.get(
      `todo_funkos_page_${hash(JSON.stringify(query))}`,
    )
    if (cache) {
      return cache
    }
    const queryBuilder = this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')

    const pagination = await paginate(query, queryBuilder, {
      sortableColumns: ['id', 'nombre', 'categoria.nombre', 'precio'],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['nombre', 'cantidad', 'precio', 'categoria'],
      filterableColumns: {
        nombre: [FilterOperator.EQ, FilterSuffix.NOT],
        cantidad: true,
        precio: true,
        categoria: [FilterOperator.EQ, FilterSuffix.NOT],
        isDeleted: [FilterOperator.EQ, FilterSuffix.NOT],
      },
    })
    const res = {
      data: (pagination.data ?? []).map((funko) =>
        this.funkoMapper.funkoToResponseFunkoDto(funko),
      ),
      meta: pagination.meta,
      links: pagination.links,
    }
    await this.cacheManager.set(
      `todo_funkos_page_${hash(JSON.stringify(query))}`,
      res,
      60,
    )
    return res
  }

  async findOne(id: number): Promise<ResponseFunkoDto> {
    this.logger.log('Buscar un funko')
    const cache: ResponseFunkoDto = await this.cacheManager.get(`funko-${id}`)
    if (cache) {
      return cache
    }
    const foundFunko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .where('funko.id = :id', { id })
      .getOne()
    if (!foundFunko) {
      throw new NotFoundException(`Funko no encontrado ${id} no existe`)
    }
    await this.cacheManager.set(`funko-${id}`, foundFunko, 60000)
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
    await this.invalidateCacheKey('funkos')
    await this.invalidateCacheKey(`funko-${id}`)
    return dto
  }

  async remove(id: number) {
    this.logger.log('Eliminar un funko')
    const funkoToRemove = await this.exists(id)
    const dto = this.funkoMapper.funkoToResponseFunkoDto(funkoToRemove)
    this.onChange(NotificacionTipo.DELETE, dto)
    await this.invalidateCacheKey('funkos')
    await this.invalidateCacheKey(`funko-${id}`)
    return dto
  }

  async removeSoft(id: number) {
    this.logger.log('Eliminar un funko')
    const funkoToRemove = await this.exists(id)
    funkoToRemove.isDeleted = true
    this.funkoRepository.save(funkoToRemove)
    const dto = this.funkoMapper.funkoToResponseFunkoDto(funkoToRemove)
    this.onChange(NotificacionTipo.DELETE, dto)
    await this.invalidateCacheKey('funkos')
    await this.invalidateCacheKey(`funko-${id}`)
    return dto
  }

  public async exists(id: number): Promise<Funko> {
    const cache: Funko = await this.cacheManager.get(`funko-${id}`)
    if (cache) {
      return cache
    }
    const funko = await this.funkoRepository.findOneBy({ id })
    if (!funko) {
      throw new BadRequestException(`Funko no encontrado ${id} no existe`)
    }
    await this.cacheManager.set(`funko-${id}`, funko, 60)
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
        imagePath = this.storageService.getFileNameWithoutUrl(
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
      filePath = `${file.filename}`
    } else {
      filePath = file.filename
    }
    funkoToUpdate.imagen = filePath
    const funkoUpdated = await this.funkoRepository.save(funkoToUpdate)
    const dto = this.funkoMapper.funkoToResponseFunkoDto(funkoUpdated)
    await this.invalidateCacheKey('funkos')
    await this.invalidateCacheKey(`funko-${id}`)
    this.onChange(NotificacionTipo.UPDATE, dto)
    return dto
  }

  async invalidateCacheKey(KeyPattern: string) {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(KeyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
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
