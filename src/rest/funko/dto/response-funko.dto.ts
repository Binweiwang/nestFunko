import { ApiProperty } from '@nestjs/swagger'

export class ResponseFunkoDto {
  @ApiProperty({ example: 1, description: 'ID del funko' })
  id: number
  @ApiProperty({ example: 'Funko 1', description: 'Nombre del funko' })
  nombre: string
  @ApiProperty({ example: 10, description: 'Cantidad del funko' })
  cantidad: number
  @ApiProperty({
    example: 'https://example.com/imagen.jpg',
    description: 'Imagen del funko',
  })
  imagen: string
  @ApiProperty({
    example: '2024-09-01T12:34:56Z',
    description: 'Fecha de creación del funko',
  })
  createdAt: Date
  @ApiProperty({
    example: '2024-09-02T10:20:30Z',
    description: 'Fecha de actualización del funko',
  })
  updatedAt: Date
  @ApiProperty({
    example: 'DISNEY',
    description: 'Categoría del funko',
  })
  categoria: string
  @ApiProperty({
    example: true,
    description: 'Indica si el funko está activo',
  })
  isActive: boolean
}
