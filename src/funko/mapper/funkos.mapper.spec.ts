import { Test, TestingModule } from '@nestjs/testing'
import { Categoria } from '../../categorias/entities/categoria.entity'
import { FunkoMapper } from './funko.mapper'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { Funko } from '../entities/funko.entity'
import { ResponseFunkoDto } from '../dto/response-funko.dto'

describe('FunkoMapper', () => {
  let funkosMapper: FunkoMapper

  const categoriaEntity: Categoria = {
    id: '51310e5f-4b47-4994-9f66-975bbdacdd35',
    nombre: 'Categoria 1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: true,
    funkos: [],
  }

  const createProductoDto: CreateFunkoDto = {
    nombre: 'Producto 1',
    precio: 1000,
    cantidad: 10,
    imagen: 'https://www.google.com',
    categoria: categoriaEntity.id,
  }

  const funkoEntity: Funko = {
    id: 1,
    nombre: 'Producto 1',
    precio: 1000,
    cantidad: 10,
    imagen: 'https://www.google.com',
    categoria: categoriaEntity,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FunkoMapper],
    }).compile()

    funkosMapper = module.get<FunkoMapper>(FunkoMapper)
  })

  it('should be defined', () => {
    expect(funkosMapper).toBeDefined()
  })

  it('should map CreateProductoDto to ProductoEntity', () => {
    const expectedProductoEntity: Funko = {
      ...funkoEntity,
      categoria: categoriaEntity,
    }

    const funko: Funko = funkosMapper.toFunko(
      createProductoDto,
      categoriaEntity,
    )

    expect(funko).toBeInstanceOf(Funko)
    expect(funko.precio).toEqual(expectedProductoEntity.precio)
    expect(funko.imagen).toEqual(expectedProductoEntity.imagen)
    expect(funko.categoria).toEqual(expectedProductoEntity.categoria)
  })

  it('should map ProductoEntity to ResponseProductoDto', () => {
    const responseFunkoDto: ResponseFunkoDto = {
      ...funkoEntity,
      categoria: categoriaEntity.nombre,
      isActive: funkoEntity.isDeleted,
    }

    const actualResponseProductoDto: ResponseFunkoDto =
      funkosMapper.funkoToResponseFunkoDto(funkoEntity)

    expect(actualResponseProductoDto).toBeInstanceOf(ResponseFunkoDto)

    expect(actualResponseProductoDto.imagen).toEqual(funkoEntity.imagen)
    expect(actualResponseProductoDto.categoria).toEqual(
      responseFunkoDto.categoria,
    )
  })
})
