import { Test, TestingModule } from '@nestjs/testing'
import { CategoriasService } from './categorias.service'
import { CategoriasMapper } from './mapper/categorias.mapper'
import { Repository } from 'typeorm'
import { Categoria } from './entities/categoria.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CreateCategoriaDto } from './dto/create-categoria.dto'
import { BadRequestException } from '@nestjs/common'

describe('CategoriasService', () => {
  let service: CategoriasService
  let mapper: CategoriasMapper
  let categoriarepositorio: Repository<Categoria>

  const categoriasMapperMock = {
    toEntity: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriasService,
        { provide: CategoriasMapper, useValue: categoriasMapperMock },
        {
          provide: getRepositoryToken(Categoria),
          useClass: Repository,
        },
      ],
    }).compile()

    service = module.get<CategoriasService>(CategoriasService)
    categoriarepositorio = module.get<Repository<Categoria>>(
      getRepositoryToken(Categoria),
    )
    mapper = module.get<CategoriasMapper>(CategoriasMapper)
  })
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('findAll', () => {
    it('buscar todas las categorias', async () => {
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
        .spyOn(categoriarepositorio, 'find')
        .mockResolvedValue([testCategoria])
      expect(await service.findAll()).toEqual([testCategoria])
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
      const testCategoria = new Categoria()
      testCategoria.nombre = 'test'
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn(() => testCategoria),
      }
      jest.spyOn(mapper, 'toEntity').mockReturnValue(testCategoria)
      jest.spyOn(service, 'exists').mockReturnValue(null)
      jest
        .spyOn(categoriarepositorio, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(categoriarepositorio, 'save').mockResolvedValue(testCategoria)
      expect(await service.create(new CreateCategoriaDto())).toEqual(
        testCategoria,
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
