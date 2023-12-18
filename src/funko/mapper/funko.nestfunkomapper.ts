import { Injectable } from '@nestjs/common'
import { Funko } from '../entities/funko.entity'
import { ResponseFunkoDto } from '../dto/response-funko.dto'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { plainToClass } from 'class-transformer'

@Injectable()
export class NestFunkoMapper {
  toFunko(createFunkoDto: CreateFunkoDto): Funko {
    return plainToClass(Funko, createFunkoDto)
  }
  funkoToResponseFunkoDto(funko: Funko): ResponseFunkoDto {
    const responseFunkoDto = new ResponseFunkoDto()
    responseFunkoDto.nombre = funko.nombre
    responseFunkoDto.cantidad = funko.cantidad
    responseFunkoDto.imagen = funko.imagen
    responseFunkoDto.createdAt = funko.createdAt
    responseFunkoDto.updatedAt = funko.updatedAt
    responseFunkoDto.categoria = funko.categoria
    responseFunkoDto.isActive = funko.isActive
    return responseFunkoDto
  }
}
