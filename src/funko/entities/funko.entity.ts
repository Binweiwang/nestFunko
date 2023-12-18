import { Categoria } from '../dto/create-funko.dto'

export class Funko {
  id: number
  nombre: string
  cantidad: number
  imagen: string
  createdAt: Date
  updatedAt: Date
  categoria: Categoria
  isActive: boolean
}
