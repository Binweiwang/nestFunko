import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { Funko } from './entities/funko.entity'

@Injectable()
export class FunkoService {
  private readonly logger: Logger = new Logger(FunkoService.name)
  private funkos: Funko[] = []
  private idActual = 1
  create(createFunkoDto: CreateFunkoDto) {
    this.logger.log('Crear un funko')
    const funko: Funko = {
      id: this.idActual,
      ...createFunkoDto,
      name: createFunkoDto.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: createFunkoDto.isActive,
    }
    this.idActual++
    this.funkos.push(funko)
    return funko
  }

  findAll() {
    this.logger.log('Buscar todos los funkos')
    return this.funkos
  }

  findOne(id: number) {
    this.logger.log('Buscar un funko')
    return this.funkos.find((funko) => funko.id == id)
  }

  update(id: number, updateFunkoDto: UpdateFunkoDto) {
    this.logger.log('Actualizar un funko')
    const index = this.funkos.findIndex((funko) => funko.id == id)
    if (index == -1) {
      throw new HttpException('Funko no encontrado', HttpStatus.NOT_FOUND)
    }
    if (id <= 0) {
      throw new HttpException('Id no valido', HttpStatus.BAD_REQUEST)
    }
    this.funkos[index] = {
      ...this.funkos[index],
      ...updateFunkoDto,
      updatedAt: new Date(),
    }
    return this.funkos[index]
  }
  remove(id: number) {
    this.logger.log('Eliminar un funko')
    const index = this.funkos.findIndex((funko) => funko.id == id)
    if (index == -1) {
      throw new HttpException('Funko no encontrado', HttpStatus.NOT_FOUND)
    }
    if (id <= 0) {
      throw new HttpException('Id no valido', HttpStatus.BAD_REQUEST)
    }
    this.funkos.splice(index, 1)
  }
}
