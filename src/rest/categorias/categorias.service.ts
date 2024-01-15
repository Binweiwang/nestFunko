import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateCategoriaDto } from './dto/create-categoria.dto'
import { UpdateCategoriaDto } from './dto/update-categoria.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { Categoria } from './entities/categoria.entity'
import { CategoriasMapper } from './mapper/categorias.mapper'
import {
  Notificacion,
  NotificacionTipo,
} from '../../websockets/models/notificacion.model'
import { NotificationsCategoriaGateway } from '../../websockets/notifications-categoria/notifications-categoria.gateway'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { hash } from 'typeorm/util/StringUtils'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate'

@Injectable()
export class CategoriasService {
  private readonly logger = new Logger(CategoriasService.name)

  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly categoriasMapper: CategoriasMapper,
    private readonly categoriaNotificacionGateway: NotificationsCategoriaGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(query: PaginateQuery) {
    this.logger.log('Buscar todas categorias')
    const cache = await this.cacheManager.get(
      `todo_categorias_page_${hash(JSON.stringify(query))}}`,
    )
    if (cache) {
      return cache
    }
    const res = await paginate(query, this.categoriaRepository, {
      sortableColumns: ['nombre'],
      defaultSortBy: [['nombre', 'ASC']],
      searchableColumns: ['nombre'],
      filterableColumns: {
        nombre: [FilterOperator.EQ, FilterSuffix.NOT],
        isDeleted: [FilterOperator.EQ, FilterSuffix.NOT],
      },
    })
    await this.cacheManager.set(
      `todo_categorias_page_${hash(JSON.stringify(query))}`,
      res,
      60,
    )
    return res
  }

  async findOne(id: string): Promise<Categoria> {
    this.logger.log(`Find one categoria by id:${id}`)
    const cache: Categoria = await this.cacheManager.get(`categoria-${id}`)
    if (cache) {
      return cache
    }
    const categoriaToFound = await this.categoriaRepository.findOneBy({ id })
    if (!categoriaToFound) {
      this.logger.log(`Categoria with id:${id} not found`)
      throw new NotFoundException(`Categoria con id ${id} no encontrada`)
    }
    this.cacheManager.set(`categoria-${id}`, categoriaToFound, 60000)
    return categoriaToFound
  }

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    this.logger.log(`Create categoria ${createCategoriaDto}`)
    const categoriaToCreate = this.categoriasMapper.toEntity(createCategoriaDto)
    const categoria = await this.exists(categoriaToCreate.nombre)

    if (categoria) {
      this.logger.log(`Categoria with name:${categoria.nombre} already exists`)
      throw new BadRequestException(
        `La categoria con nombre ${categoria.nombre} ya existe`,
      )
    }

    const res = await this.categoriaRepository.save({
      ...categoriaToCreate,
      id: uuidv4(),
    })
    this.onChange(NotificacionTipo.CREATE, res)
    await this.invalidateCacheKey('categorias')
    return res
  }

  async update(
    id: string,
    updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<Categoria> {
    this.logger.log(`Update categoria by id:${id} - ${updateCategoriaDto}`)
    const categoryToUpdated = await this.findOne(id)

    if (updateCategoriaDto.nombre) {
      const categoria = await this.exists(updateCategoriaDto.nombre)
      if (categoria && categoria.id !== categoryToUpdated.id) {
        this.logger.log(`La categoria con nombre ${categoria.nombre} ya existe`)
        throw new BadRequestException(
          `La categoria con nombre ${categoria.nombre} ya existe`,
        )
      }
    }

    const res = await this.categoriaRepository.save({
      ...categoryToUpdated,
      ...updateCategoriaDto,
    })
    this.onChange(NotificacionTipo.UPDATE, res)
    await this.invalidateCacheKey('categorias')
    await this.invalidateCacheKey(`categoria-${id}`)
    return res
  }

  async remove(id: string): Promise<Categoria> {
    this.logger.log(`Remove categoria by id:${id}`)
    const categoriaToRemove = await this.findOne(id)
    const res = await this.categoriaRepository.remove(categoriaToRemove)
    this.onChange(NotificacionTipo.DELETE, res)
    await this.invalidateCacheKey('categorias')
    await this.invalidateCacheKey(`categoria-${id}`)
    return res
  }

  async removeSoft(id: string): Promise<Categoria> {
    this.logger.log(`Remove categoria soft by id:${id}`)
    const categoriaToRemove = await this.findOne(id)
    const res = await this.categoriaRepository.save({
      ...categoriaToRemove,
      updatedAt: new Date(),
      isDeleted: true,
    })
    this.onChange(NotificacionTipo.DELETE, res)
    await this.invalidateCacheKey('categorias')
    await this.invalidateCacheKey(`categoria-${id}`)
    return res
  }

  public async exists(nombreCategoria: string): Promise<Categoria> {
    return await this.categoriaRepository
      .createQueryBuilder()
      .where('LOWER(nombre) = LOWER(:nombre)', {
        nombre: nombreCategoria.toLowerCase(),
      })
      .getOne()
  }

  private onChange(tipo: NotificacionTipo, data: Categoria) {
    const notificacion = new Notificacion<Categoria>(
      'Categoria',
      tipo,
      data,
      new Date(),
    )
    this.categoriaNotificacionGateway.sendMessage(notificacion)
  }

  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }
}
