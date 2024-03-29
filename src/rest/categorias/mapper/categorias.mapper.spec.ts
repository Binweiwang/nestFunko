import { Test, TestingModule } from '@nestjs/testing'
import { CategoriasMapper } from './categorias.mapper'
import { CreateCategoriaDto } from '../dto/create-categoria.dto'
import { Categoria } from '../entities/categoria.entity'
import { UpdateCategoriaDto } from '../dto/update-categoria.dto'

describe('CategoriasMapper', () => {
  let provider: CategoriasMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriasMapper],
    }).compile()

    provider = module.get<CategoriasMapper>(CategoriasMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })

  describe('CategoriasMapper', () => {
    let categoriasMapper: CategoriasMapper

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [CategoriasMapper],
      }).compile()

      categoriasMapper = module.get<CategoriasMapper>(CategoriasMapper)
    })

    it('should be defined', () => {
      expect(categoriasMapper).toBeDefined()
    })

    it('should map CreateCategoriaDto to CategoriaEntity', () => {
      const createCategoriaDto: CreateCategoriaDto = {
        nombre: 'Categoria 1',
      }

      const expectedCategoriaEntity: Categoria = {
        id: '51310e5f-4b47-4994-9f66-975bbdacdd35',
        nombre: 'Categoria 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        funkos: [],
      }

      const actualCategoriaEntity: Categoria =
        categoriasMapper.toEntity(createCategoriaDto)

      expect(actualCategoriaEntity.nombre).toEqual(
        expectedCategoriaEntity.nombre,
      )
    })

    it('should map UpdateCategoriaDto to CategoriaEntity', () => {
      const updateCategoriaDto: UpdateCategoriaDto = {
        nombre: 'Categoria 1',
        isDeleted: true,
      }

      const expectedCategoriaEntity: Categoria = {
        id: '51310e5f-4b47-4994-9f66-975bbdacdd35',
        nombre: 'Categoria 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: true,
        funkos: [],
      }

      const actualCategoriaEntity: Categoria =
        categoriasMapper.toEntity(updateCategoriaDto)

      expect(actualCategoriaEntity).toBeInstanceOf(Categoria)

      expect(actualCategoriaEntity.nombre).toEqual(
        expectedCategoriaEntity.nombre,
      )
    })
  })
})
