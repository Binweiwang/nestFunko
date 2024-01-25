import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Categoria } from '../../categorias/entities/categoria.entity'

@Entity('Funkos')
export class Funko {
  public static IMAGE_DEFAULT = 'https://via.placeholder.com/150'
  @PrimaryGeneratedColumn()
  id: number
  @Column({ type: 'varchar', length: 255, nullable: false })
  nombre: string
  @Column({ type: 'integer', nullable: false })
  cantidad: number
  @Column({ type: 'double precision', default: 0.0 })
  precio: number
  @Column({ default: Funko.IMAGE_DEFAULT })
  imagen: string
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date
  @CreateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date
  @ManyToOne(() => Categoria, (categoria) => categoria.funkos)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria
  @Column({ name: 'is_active', type: 'boolean', default: false })
  isDeleted: boolean
}
