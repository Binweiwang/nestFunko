import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'
import { Funko } from '../../funko/entities/funko.entity'

@Entity({ name: 'categorias' })
export class Categoria {
  @PrimaryColumn({ type: 'uuid' })
  id: string
  @Column({ type: 'varchar', length: 255, unique: true })
  nombre: string
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
  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean
  @OneToMany(() => Funko, (funko) => funko.categoria)
  funkos: Funko[]
}
