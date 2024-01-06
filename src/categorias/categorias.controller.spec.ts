import { Test, TestingModule } from '@nestjs/testing'
import { CategoriasController } from './categorias.controller'
import { CategoriasService } from './categorias.service'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Categoria } from './entities/categoria.entity'

describe('CategoriasController', () => {
  let controller: CategoriasController
  let service: CategoriasService
  const categoriaServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    removeSoft: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriasController],
      providers: [
        {
          provide: CategoriasService,
          useValue: categoriaServiceMock,
        },
      ],
    }).compile()

    controller = module.get<CategoriasController>(CategoriasController)
    service = module.get<CategoriasService>(CategoriasService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('findAll', () => {
    it('should get all categorias', async () => {
      const testCategories = [
        {
          id: '1',
          nombre: 'test',
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          funkos: [],
        },
      ]
      jest.spyOn(service, 'findAll').mockResolvedValue(testCategories)
      expect(await controller.findAll()).toEqual(testCategories)
    })
  })
  describe('findOne', () => {
    it('should get one categoria', async () => {
      const testCategoria = {
        id: '1',
        nombre: 'test',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        funkos: [],
      }
      jest.spyOn(service, 'findOne').mockResolvedValue(testCategoria)
      expect(await controller.findOne('1')).toEqual(testCategoria)
    })
    it('should throw NotFoundException if categoria does not exist', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException)
    })
  })
  describe('create', () => {
    it('should create a categoria', async () => {
      const dto = {
        nombre: 'test',
      }
      const testCategoria = {
        id: '1',
        nombre: 'test',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        funkos: [],
      }
      jest.spyOn(service, 'create').mockResolvedValue(testCategoria)
      expect(await controller.create(dto)).toEqual(testCategoria)
    })
    it('should throw NotFoundException if categoria does not exist', async () => {
      const dto = {
        nombre: 'test',
      }
      jest.spyOn(service, 'create').mockRejectedValue(new NotFoundException())
      await expect(controller.create(dto)).rejects.toThrow(NotFoundException)
    })
    it('should throw BadRequestException if categoria does not exist', async () => {
      const dto = {
        nombre: '-213',
      }
      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException())
      await expect(controller.create(dto)).rejects.toThrow(BadRequestException)
    })
  })
  describe('update', () => {
    it('should update a categoria', async () => {
      const id = '1'
      const dto = {
        nombre: 'test',
        isDeleted: true,
      }
      const testCategoria = {
        id: '1',
        nombre: 'test',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        funkos: [],
      }
      jest.spyOn(service, 'update').mockResolvedValue(testCategoria)
      expect(await controller.update(id, dto)).toEqual(testCategoria)
    })
    it('should throw NotFoundException if categoria does not exist', async () => {
      const id = '1'
      const dto = {}
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())
      await expect(controller.update(id, dto)).rejects.toThrow(
        NotFoundException,
      )
    })
    it('should throw BadRequestException if categoria does not exist', async () => {
      const id = '1'
      const dto = {
        nombre: '-213',
      }
      jest.spyOn(service, 'update').mockRejectedValue(new BadRequestException())
      await expect(controller.update(id, dto)).rejects.toThrow(
        BadRequestException,
      )
    })
  })
  describe('remove', () => {
    it('should remove a categoria', async () => {
      const id = '1'
      const mockResult: Categoria = new Categoria()
      jest.spyOn(service, 'removeSoft').mockResolvedValue(mockResult)
      await controller.remove(id)
      expect(service.removeSoft).toHaveBeenCalledWith(id)
    })
    it('should throw NotFoundException if categoria does not exist', async () => {
      const id = '1'
      jest
        .spyOn(service, 'removeSoft')
        .mockRejectedValue(new NotFoundException())
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException)
    })
  })
})
