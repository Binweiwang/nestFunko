import { PartialType } from '@nestjs/mapped-types'
import { CreateFunkoDto } from './create-funko.dto'
import { IsBoolean, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateFunkoDto extends PartialType(CreateFunkoDto) {
  @ApiProperty({ example: 'Funko', description: 'Nombre del funko' })
  @IsOptional()
  nombre?: string
  @ApiProperty({ example: 10, description: 'Cantidad de funkos' })
  @IsOptional()
  cantidad?: number
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL de la imagen del funko',
  })
  @IsOptional()
  imagen?: string
  @ApiProperty({ example: 'DISNEY', description: 'Categoria del funko' })
  @IsOptional()
  categoria?: string
  @ApiProperty({
    example: true,
    description: 'Indica si el funko ha sido eliminado',
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un boolean' })
  isActive?: boolean
}
