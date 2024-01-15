import { Test, TestingModule } from '@nestjs/testing'
import { FunkoService } from './funko.service'
import { Repository } from 'typeorm'
import { Funko } from './entities/funko.entity'
import { Categoria } from '../categorias/entities/categoria.entity'
import { FunkoMapper } from './mapper/funko.mapper'
import { ResponseFunkoDto } from './dto/response-funko.dto'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { BadRequestException } from '@nestjs/common'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { NotificationsFunkoGateway } from '../../websockets/notifications-funko/notifications-funko.gateway'
import { StorageService } from '../storage/storage.service'
import { NotificationsModule } from '../../websockets/notifications.module'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'

describe('FunkoService', () => {
  let service: FunkoService
  let funkoRepository: Repository<Funko>
  let categoriaRepository: Repository<Categoria>
  let mapper: FunkoMapper
  let storageService: StorageService
  let cacheManager: Cache

  const funkosMapperMock = {
    toFunko: jest.fn(),
    funkoToResponseFunkoDto: jest.fn(),
  }
  const storageServiceMock = {
    removeFile: jest.fn(),
    getFileNameWithoutUrl: jest.fn(),
  }
  const notificacionFunkoGatewayMock = {
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
      imports: [NotificationsModule],
      providers: [
        FunkoService,
        {
          provide: NotificationsFunkoGateway,
          useValue: notificacionFunkoGatewayMock,
        },
        { provide: FunkoMapper, useValue: funkosMapperMock },
        { provide: getRepositoryToken(Funko), useClass: Repository },
        { provide: getRepositoryToken(Categoria), useClass: Repository },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile()

    service = module.get<FunkoService>(FunkoService)
    funkoRepository = module.get<Repository<Funko>>(getRepositoryToken(Funko))
    categoriaRepository = module.get<Repository<Categoria>>(
      getRepositoryToken(Categoria),
    )
    mapper = module.get<FunkoMapper>(FunkoMapper)
    storageService = module.get<StorageService>(StorageService)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findOne', () => {
    it('buscar un funko', async () => {
      const funko = new Funko()
      const funkoDto = new ResponseFunkoDto()
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(funko),
      }
      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(mapper, 'funkoToResponseFunkoDto').mockReturnValue(funkoDto)
      expect(await service.findOne(1)).toBe(funkoDto)
    })
    it('buscar un funko que no existe', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(undefined),
      }
      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      await expect(service.findOne(1)).rejects.toThrow(
        'Funko no encontrado 1 no existe',
      )
    })
  })
  describe('findAll', () => {
    it('buscar todos los funkos', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'funkos',
      }
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([]),
      }
      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest
        .spyOn(mapper, 'funkoToResponseFunkoDto')
        .mockReturnValue(new ResponseFunkoDto())
      const result: any = await service.findAll(paginateOptions)
      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      expect(result.links.current).toEqual(
        `funkos?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=id:ASC`,
      )
      expect(cacheManager.get).toHaveBeenCalled()
      expect(cacheManager.set).toHaveBeenCalled()
    })
  })
  describe('create', () => {
    it('crear un funko', async () => {
      const mockCategoria = new Categoria()
      const mockFunko = new Funko()
      const mockFunkoDto = new ResponseFunkoDto()
      jest.spyOn(service, 'checkCategoria').mockResolvedValue(mockCategoria)
      jest.spyOn(mapper, 'toFunko').mockReturnValue(mockFunko)
      jest.spyOn(funkoRepository, 'save').mockResolvedValue(mockFunko)
      jest
        .spyOn(mapper, 'funkoToResponseFunkoDto')
        .mockReturnValue(mockFunkoDto)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])
      expect(await service.create(new CreateFunkoDto())).toEqual(mockFunkoDto)
    })
    it('crear un funko con una categoria que no existe', async () => {
      jest
        .spyOn(service, 'checkCategoria')
        .mockRejectedValue(
          new BadRequestException('La categoria undefined no existe'),
        )
      await expect(service.create(new CreateFunkoDto())).rejects.toThrow(
        'La categoria undefined no existe',
      )
    })
  })
  describe('checkCategoria', () => {
    it('checkCategoria', async () => {
      const mockCategoria = new Categoria()
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(mockCategoria),
      }
      jest
        .spyOn(categoriaRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      expect(await service.checkCategoria('categoria')).toEqual(mockCategoria)
    })
    it('checkCategoria que no existe', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(undefined),
      }
      jest
        .spyOn(categoriaRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      await expect(service.checkCategoria('categoria')).rejects.toThrow(
        'La categoria categoria no existe',
      )
    })
  })
  describe('update', () => {
    it('update', async () => {
      const mockFunko = new Funko()
      const mockFunkoDto = new ResponseFunkoDto()
      const mockCategoria = new Categoria()
      jest.spyOn(service, 'findOne').mockResolvedValue(mockFunkoDto)
      jest.spyOn(service, 'checkCategoria').mockResolvedValue(mockCategoria)
      jest.spyOn(funkoRepository, 'save').mockResolvedValue(mockFunko)
      jest
        .spyOn(mapper, 'funkoToResponseFunkoDto')
        .mockReturnValue(mockFunkoDto)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])
      expect(await service.update(1, new CreateFunkoDto())).toEqual(
        mockFunkoDto,
      )
    })
    it('update con una categoria que no existe', async () => {
      const mockFunkoDto = new ResponseFunkoDto()
      jest.spyOn(service, 'findOne').mockResolvedValue(mockFunkoDto)
      jest
        .spyOn(service, 'checkCategoria')
        .mockRejectedValue(
          new BadRequestException('La categoria undefined no existe'),
        )
      await expect(service.update(1, new CreateFunkoDto())).rejects.toThrow(
        'La categoria undefined no existe',
      )
    })
    it('update con un funko que no existe', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(
          new BadRequestException('Funko no encontrado 1 no existe'),
        )
      await expect(service.update(1, new CreateFunkoDto())).rejects.toThrow(
        'Funko no encontrado 1 no existe',
      )
    })
    it('update categoria de updateFunkoDto', async () => {
      const mockUpdateFunkoDto = new UpdateFunkoDto()
      mockUpdateFunkoDto.categoria = 'categoria'
      const mockFunko = new Funko()
      const mockFunkoDto = new ResponseFunkoDto()
      const mockCategoria = new Categoria()
      jest.spyOn(service, 'findOne').mockResolvedValue(mockFunkoDto)
      jest.spyOn(service, 'checkCategoria').mockResolvedValue(mockCategoria)
      jest.spyOn(funkoRepository, 'save').mockResolvedValue(mockFunko)
      jest
        .spyOn(mapper, 'funkoToResponseFunkoDto')
        .mockReturnValue(mockFunkoDto)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])
      expect(await service.update(1, mockUpdateFunkoDto)).toEqual(mockFunkoDto)
    })
  })
  describe('remove', () => {
    it('eliminar un funko', async () => {
      const mockFunko = new Funko()
      jest.spyOn(service, 'exists').mockResolvedValue(mockFunko)
      jest.spyOn(funkoRepository, 'remove').mockResolvedValue(mockFunko)
      expect(await service.remove(1)).toEqual(mockFunko)
    })
  })
  describe('removeSoft', () => {
    it('eliminar un funko', async () => {
      const mockFunko = new Funko()
      const mockFunkoDto = new ResponseFunkoDto()
      jest.spyOn(service, 'exists').mockResolvedValue(mockFunko)
      jest.spyOn(funkoRepository, 'save').mockResolvedValue(mockFunko)
      jest
        .spyOn(mapper, 'funkoToResponseFunkoDto')
        .mockReturnValue(mockFunkoDto)
      expect(await service.removeSoft(1)).toEqual(mockFunkoDto)
    })
  })
  describe('exists', () => {
    it('exists', async () => {
      const mockFunko = new Funko()
      jest.spyOn(funkoRepository, 'findOneBy').mockResolvedValue(mockFunko) // 使用 mockResolvedValue 模拟异步操作
      const result = await service.exists(1)
      expect(result).toEqual(mockFunko)
    })
    it('exists que no existe', async () => {
      jest.spyOn(funkoRepository, 'findOneBy').mockResolvedValue(undefined) // 使用 mockResolvedValue 模拟异步操作
      await expect(service.exists(1)).rejects.toThrow(
        'Funko no encontrado 1 no existe',
      )
    })
  })
  describe('updateImage', () => {
    it('should update a producto image', async () => {
      const mockRequest = {
        protocol: 'http',
        get: () => 'localhost',
      }
      const mockFile = {
        filename: 'new_image',
      }

      const mockProductoEntity = new Funko()
      const mockResponseProductoDto = new ResponseFunkoDto()

      jest.spyOn(service, 'exists').mockResolvedValue(mockProductoEntity)

      jest.spyOn(funkoRepository, 'save').mockResolvedValue(mockProductoEntity)
      jest
        .spyOn(cacheManager.store, 'keys')
        .mockResolvedValue(['someKey1', 'someKey2'])
      jest
        .spyOn(mapper, 'funkoToResponseFunkoDto')
        .mockReturnValue(mockResponseProductoDto)

      expect(
        await service.updateImage(1, mockFile as any, mockRequest as any, true),
      ).toEqual(mockResponseProductoDto)

      expect(storageService.removeFile).toHaveBeenCalled()
      expect(storageService.getFileNameWithoutUrl).toHaveBeenCalled()
    })
  })
})
