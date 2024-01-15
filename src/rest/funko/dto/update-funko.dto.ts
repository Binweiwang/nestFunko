import { PartialType } from '@nestjs/mapped-types'
import { CreateFunkoDto } from './create-funko.dto'
import { IsBoolean, IsOptional } from 'class-validator'
import { Categoria } from '../../categorias/entities/categoria.entity'

export class UpdateFunkoDto extends PartialType(CreateFunkoDto) {
  @IsOptional()
  nombre?: string
  @IsOptional()
  cantidad?: number
  @IsOptional()
  imagen?: string
  @IsOptional()
  categoria?: string
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un boolean' })
  isActive?: boolean
}
