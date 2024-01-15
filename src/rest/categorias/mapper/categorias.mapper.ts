import { Injectable } from '@nestjs/common'
import { CreateCategoriaDto } from '../dto/create-categoria.dto'
import { UpdateCategoriaDto } from '../dto/update-categoria.dto'
import { Categoria } from '../entities/categoria.entity'
import { plainToClass } from 'class-transformer'

@Injectable()
export class CategoriasMapper {
  toEntity(
    createCategoriaDto: CreateCategoriaDto | UpdateCategoriaDto,
  ): Categoria {
    return plainToClass(Categoria, createCategoriaDto)
  }
}
