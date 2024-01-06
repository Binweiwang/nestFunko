import { IsString, IsNotEmpty, Min, Max, MaxLength } from 'class-validator'
import { Transform } from 'class-transformer'
export class CreateFunkoDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @IsString({ message: 'El nombre debe ser un string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(50, { message: 'El nombre no puede ser mayor a 50 caracteres' })
  readonly nombre: string
  @IsNotEmpty({ message: 'La fecha no puede estar vacia' })
  @Min(0, { message: 'La cantidad no puede ser menor a 0' })
  @Max(1000000, { message: 'La cantidad no puede ser mayor a 1000' })
  readonly cantidad: number
  @IsNotEmpty({ message: 'El precio no puede estar vacio' })
  @Min(0, { message: 'El precio no puede ser menor a 0' })
  @Max(1000000, { message: 'El precio no puede ser mayor a 1000' })
  readonly precio: number
  @IsNotEmpty({ message: 'La imagen no puede estar vacia' })
  @IsString({ message: 'La imagen debe ser un string' })
  @MaxLength(500, { message: 'La imagen no puede ser mayor a 500 caracteres' })
  readonly imagen: string
  @IsNotEmpty({ message: 'La categoria no puede estar vacia' })
  readonly categoria: string
}
