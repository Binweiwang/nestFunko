import { Injectable } from '@nestjs/common'
import { Funko } from '../entities/funko.entity'
import { ResponseFunkoDto } from '../dto/response-funko.dto'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { plainToClass } from 'class-transformer'
import { Categoria } from '../../categorias/entities/categoria.entity'

@Injectable()
export class FunkoMapper {
  toFunko(createFunkoDto: CreateFunkoDto, categoria: Categoria): Funko {
    const funko = plainToClass(Funko, createFunkoDto)
    funko.categoria = categoria
    return funko
  }
  funkoToResponseFunkoDto(funko: Funko): ResponseFunkoDto {
    const responseFunkoDto = plainToClass(ResponseFunkoDto, funko)
    if (funko.categoria && funko.categoria.nombre) {
      responseFunkoDto.categoria = funko.categoria.nombre
    } else {
      responseFunkoDto.categoria = null
    }
    return responseFunkoDto
  }
}
