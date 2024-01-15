import { Test, TestingModule } from '@nestjs/testing'
import { CategoriasService } from './categorias.service'
import { CategoriasMapper } from './mapper/categorias.mapper'
import { Repository } from 'typeorm'
import { Categoria } from './entities/categoria.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CreateCategoriaDto } from './dto/create-categoria.dto'
import { BadRequestException } from '@nestjs/common'
import { NotificationsCategoriaGateway } from '../websockets/notifications-categoria/notifications-categoria.gateway'
import { Paginated } from 'nestjs-paginate'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

describe('CategoriasService', () => {
  let service: CategoriasService
  let mapper: CategoriasMapper
  let categoriarepositorio: Repository<Categoria>
  let cacheManager: Cache
  const categoriasMapperMock = {
    toEntity: jest.fn(),
  }
  const categoriaNotificacionGatewayMock = {
    sendMessage: jest.fn(),
  }
  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriasService,
        {
          provide: NotificationsCategoriaGateway,
          useValue: categoriaNotificacionGatewayMock,
        },
        { provide: CategoriasMapper, useValue: categoriasMapperMock },
        {
          provide: getRepositoryToken(Categoria),
          useClass: Repository,
        },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile()

    service = module.get<CategoriasService>(CategoriasService)
    categoriarepositorio = module.get<Repository<Categoria>>(
      getRepositoryToken(Categoria),
    )
    mapper = module.get<CategoriasMapper>(CategoriasMapper)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('findAll', () => {
    it('buscar todas las categorias', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'categorias',
      }
      const testCategoria = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'categorias?page=1&limit=10&sortBy=nombre:ASC',
        },
      } as Paginated<Categoria>
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      const mockQueryBuilder = {
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([testCategoria, 1]),
      }
      jest
        .spyOn(categoriarepositorio, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      const result: any = await service.findAll(paginateOptions)
      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      expect(result.meta.totalPages).toEqual(1)
      expect(result.links.current).toEqual(
        `categorias?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=nombre:ASC`,
      )
    })
  })
  describe('findOne', () => {
    it('buscar una categoria', async () => {
      const testCategoria = new Categoria()
      testCategoria.nombre = 'test'
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn(() => testCategoria),
      }
      jest
        .spyOn(categoriarepositorio, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest
        .spyOn(categoriarepositorio, 'findOneBy')
        .mockResolvedValue(testCategoria)
      expect(await service.findOne('test')).toEqual(testCategoria)
    })
    it('buscar una categoria que no existe', async () => {
      const testCategoria = new Categoria()
      testCategoria.nombre = 'test'
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn(() => testCategoria),
      }
      jest
        .spyOn(categoriarepositorio, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(categoriarepositorio, 'findOneBy').mockResolvedValue(null)
      await expect(service.findOne('test')).rejects.toThrow(
        new BadRequestException(`Categoria con id test no encontrada`),
      )
    })
  })
  describe('create', () => {
    it('crear una categoria', async () => {
      const categoriaEntity = new Categoria()
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn(() => categoriaEntity),
      }
      jest.spyOn(mapper, 'toEntity').mockReturnValue(categoriaEntity)
      jest.spyOn(service, 'exists').mockReturnValue(null)
      jest
        .spyOn(categoriarepositorio, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest
        .spyOn(categoriarepositorio, 'save')
        .mockResolvedValue(categoriaEntity)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])
      expect(await service.create(new CreateCategoriaDto())).toEqual(
        categoriaEntity,
      )
    })
    it('crear una categoria que ya existe', async () => {
      const testCategoria = new Categoria()
      testCategoria.nombre = 'test'
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn(() => testCategoria),
      }
      jest.spyOn(mapper, 'toEntity').mockReturnValue(testCategoria)
      jest.spyOn(service, 'exists').mockResolvedValue(testCategoria)
      jest
        .spyOn(categoriarepositorio, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(categoriarepositorio, 'save').mockResolvedValue(testCategoria)
      await expect(service.create(new CreateCategoriaDto())).rejects.toThrow(
        new BadRequestException(
          `La categoria con nombre ${testCategoria.nombre} ya existe`,
        ),
      )
    })
  })
  describe('update', () => {
    it('actualizar una categoria', async () => {
      const testCategoria = new Categoria()
      testCategoria.nombre = 'test'
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn(() => testCategoria),
      }
      jest.spyOn(mapper, 'toEntity').mockReturnValue(testCategoria)
      jest.spyOn(service, 'exists').mockResolvedValue(null)
      jest
        .spyOn(categoriarepositorio, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest
        .spyOn(categoriarepositorio, 'findOneBy')
        .mockResolvedValue(testCategoria)
      jest.spyOn(categoriarepositorio, 'save').mockResolvedValue(testCategoria)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])
      expect(await service.update('1', new CreateCategoriaDto())).toEqual(
        testCategoria,
      )
    })
    it('actualizar una categoria que ya existe', async () => {
      const testCategoria = new Categoria()
      testCategoria.nombre = 'test'
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn(() => testCategoria),
      }
      jest.spyOn(mapper, 'toEntity').mockReturnValue(testCategoria)
      jest.spyOn(service, 'exists').mockResolvedValue(testCategoria)
      jest
        .spyOn(categoriarepositorio, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest
        .spyOn(categoriarepositorio, 'findOneBy')
        .mockResolvedValue(testCategoria)
      jest
        .spyOn(categoriarepositorio, 'save')
        .mockRejectedValue(
          new BadRequestException(
            `La categoria con nombre ${testCategoria.nombre} ya existe`,
          ),
        )
      await expect(
        service.update('1', new CreateCategoriaDto()),
      ).rejects.toThrow(
        new BadRequestException(
          `La categoria con nombre ${testCategoria.nombre} ya existe`,
        ),
      )
    })
  })
  describe('remove', () => {
    it('eliminar una categoria', async () => {
      const testCategoria = new Categoria()
      testCategoria.nombre = 'test'
      jest
        .spyOn(categoriarepositorio, 'findOneBy')
        .mockResolvedValue(testCategoria)
      jest
        .spyOn(categoriarepositorio, 'remove')
        .mockResolvedValue(testCategoria)
      expect(await service.remove('test')).toEqual(testCategoria)
    })
  })
  describe('removeSoft', () => {
    it('eliminar una categoria soft', async () => {
      const testCategoria = new Categoria()
      testCategoria.nombre = 'test'
      jest
        .spyOn(categoriarepositorio, 'findOneBy')
        .mockResolvedValue(testCategoria)
      jest.spyOn(categoriarepositorio, 'save').mockResolvedValue(testCategoria)
      expect(await service.removeSoft('test')).toEqual(testCategoria)
    })
  })
})
