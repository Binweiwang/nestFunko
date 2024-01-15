import { Test, TestingModule } from '@nestjs/testing'
import { FunkoController } from './funko.controller'
import { FunkoService } from './funko.service'
import { ResponseFunkoDto } from './dto/response-funko.dto'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { HttpStatus } from '@nestjs/common'
import { Paginated } from 'nestjs-paginate'
import { Funko } from './entities/funko.entity'
import { Request } from 'express'

describe('FunkoController', () => {
  let controller: FunkoController
  let service: FunkoService

  const funkoServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeSoft: jest.fn(),
    updateImage: jest.fn(),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FunkoController],
      providers: [{ provide: FunkoService, useValue: funkoServiceMock }],
    }).compile()

    controller = module.get<FunkoController>(FunkoController)
    service = module.get<FunkoService>(FunkoService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('findAll', () => {
    it('todos los funkos', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'funkos',
      }
      const testFunkos = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'funkos?page=1&limit=10&sortBy=nombre:ASC',
        },
      } as Paginated<Funko>
      jest.spyOn(service, 'findAll').mockResolvedValue(testFunkos)
      const result: any = await controller.findAll(paginateOptions)
      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(result.meta.totalPages).toEqual(1)
      expect(service.findAll).toHaveBeenCalled()
    })
  })
  describe('findOne', () => {
    it('busca un funko', async () => {
      const id = 1
      const testFunko: ResponseFunkoDto = {
        id: 1,
        nombre: 'test',
        imagen: 'test',
        categoria: 'test',
        cantidad: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      }
      jest.spyOn(service, 'findOne').mockResolvedValue(testFunko)
      const result: any = await controller.findOne(id)
      expect(result).toBe(testFunko)
    })
  })
  describe('create', () => {
    it('crea un funko', async () => {
      const testFunko: CreateFunkoDto = {
        nombre: 'test',
        imagen: 'test',
        categoria: 'test',
        precio: 1,
        cantidad: 1,
      }
      const mockResult: ResponseFunkoDto = new ResponseFunkoDto()
      jest.spyOn(service, 'create').mockResolvedValue(mockResult)
      await controller.create(testFunko)
      expect(service.create).toHaveBeenCalledWith(testFunko)
      expect(mockResult).toBeInstanceOf(ResponseFunkoDto)
    })
  })
  describe('update', () => {
    it('actualiza un funko', async () => {
      const id = 1
      const testFunko: CreateFunkoDto = {
        nombre: 'test',
        imagen: 'test',
        categoria: 'test',
        precio: 1,
        cantidad: 1,
      }
      const mockResult: ResponseFunkoDto = new ResponseFunkoDto()
      jest.spyOn(service, 'update').mockResolvedValue(mockResult)
      await controller.update(id, testFunko)
      expect(service.update).toHaveBeenCalledWith(id, testFunko)
      expect(mockResult).toBeInstanceOf(ResponseFunkoDto)
    })
  })
  describe('remove', () => {
    it('should remove a specific funko softly and return 204', async () => {
      // Arrange
      const id = 1
      // Act
      jest.spyOn(service, 'removeSoft').mockResolvedValue(undefined) // 模拟异步操作
      const result = await controller.remove(id)

      // Assert
      expect(result).toEqual(HttpStatus.NO_CONTENT)
      expect(service.removeSoft).toHaveBeenCalledWith(id)
    })
  })
  describe('updateImage', () => {
    it('should update a producto image', async () => {
      const mockId = 1
      const mockFile = {} as Express.Multer.File
      const mockReq = {} as Request
      const mockResult: ResponseFunkoDto = new ResponseFunkoDto()

      jest.spyOn(service, 'updateImage').mockResolvedValue(mockResult)

      await controller.updateImage(mockId, mockFile, mockReq)
      expect(service.updateImage).toHaveBeenCalledWith(
        mockId,
        mockFile,
        mockReq,
        true,
      )
      expect(mockResult).toBeInstanceOf(ResponseFunkoDto)
    })
  })
})
