import { IsString, IsNotEmpty, IsEnum, Min } from 'class-validator'
export enum Categoria {
  DISNEY = 'DISNEY',
  MARVEL = 'MARVEL',
  DC = 'DC',
  STARWARS = 'STARWARS',
  ANIME = 'ANIME',
  SERIES = 'SERIES',
  OTROS = 'OTROS',
}
export class CreateFunkoDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @IsString()
  readonly nombre: string
  @IsNotEmpty({ message: 'La fecha no puede estar vacia' })
  @Min(0, { message: 'La cantidad no puede ser menor a 0' })
  readonly cantidad: number
  @IsNotEmpty({ message: 'La imagen no puede estar vacia' })
  readonly imagen: string
  @IsNotEmpty({ message: 'La categoria no puede estar vacia' })
  @IsEnum(Categoria, { message: 'La categoria no es valida' })
  readonly categoria: Categoria
}
