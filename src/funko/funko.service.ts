import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { Categoria, CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { Funko } from './entities/funko.entity'
import { NestFunkoMapper } from './mapper/funko.nestfunkomapper'

@Injectable()
export class FunkoService {
  private readonly logger: Logger = new Logger(FunkoService.name)
  private funkos: Funko[] = [
    {
      nombre: 'Funko 1',
      cantidad: 1,
      imagen: 'https://i.blogs.es/4e2c4d/funko-pop/1366_2000.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      categoria: Categoria.DISNEY,
      isActive: true,
      id: 1,
    },
    {
      nombre: 'Funko 2',
      cantidad: 1,
      imagen: 'https://i.blogs.es/4e2c4d/funko-pop/1366_2000.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      categoria: Categoria.DISNEY,
      isActive: true,
      id: 2,
    },
  ]
  private idActual = 3
  constructor(private readonly nestFunkoMapper: NestFunkoMapper) {}
  create(createFunkoDto: CreateFunkoDto) {
    this.logger.log('Crear un funko')
    const funko = this.nestFunkoMapper.toFunko(createFunkoDto)
    funko.id = this.idActual++
    return this.funkos.push(funko)
      ? this.nestFunkoMapper.funkoToResponseFunkoDto(funko)
      : null
  }

  findAll() {
    this.logger.log('Buscar todos los funkos')
    return this.funkos
  }

  findOne(id: number) {
    this.logger.log('Buscar un funko')
    if (id <= 0) {
      throw new BadRequestException(`${id} no es un id valido`)
    }
    if (this.funkos.find((funko) => funko.id == id) == undefined) {
      throw new NotFoundException(`Funko no encontrado ${id} no existe`)
    }
    return this.nestFunkoMapper.funkoToResponseFunkoDto(
      this.funkos.find((funko) => funko.id == id),
    )
  }

  update(id: number, updateFunkoDto: UpdateFunkoDto) {
    this.logger.log('Actualizar un funko')
    const index = this.funkos.findIndex((funko) => funko.id == id)
    if (index == -1) {
      throw new BadRequestException(`${id} no es un id valido`)
    }
    if (this.funkos.find((funko) => funko.id == id) == undefined) {
      throw new NotFoundException(`Funko no encontrado ${id} no existe`)
    }
    this.funkos[index] = {
      ...this.funkos[index],
      ...updateFunkoDto,
      updatedAt: new Date(),
    }
    return this.nestFunkoMapper.funkoToResponseFunkoDto(
      this.funkos.find((funko) => funko.id == id),
    )
  }
  remove(id: number) {
    this.logger.log('Eliminar un funko')
    const index = this.funkos.findIndex((funko) => funko.id == id)
    if (index == -1) {
      throw new BadRequestException(`${id} no es un id valido`)
    }
    if (this.funkos.find((funko) => funko.id == id) == undefined) {
      throw new NotFoundException(`Funko no encontrado ${id} no existe`)
    }
    this.funkos.splice(index, 1)
  }
}
