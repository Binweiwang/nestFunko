import { PartialType } from '@nestjs/mapped-types'
import { Categoria, CreateFunkoDto } from './create-funko.dto'
import { IsOptional } from 'class-validator'

export class UpdateFunkoDto extends PartialType(CreateFunkoDto) {
  @IsOptional()
  nombre?: string
  @IsOptional()
  cantidad?: number
  @IsOptional()
  imagen?: string
  @IsOptional()
  categoria?: Categoria
  @IsOptional()
  isActive?: boolean
}
