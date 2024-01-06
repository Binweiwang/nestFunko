import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateCategoriaDto } from './dto/create-categoria.dto'
import { UpdateCategoriaDto } from './dto/update-categoria.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { Categoria } from './entities/categoria.entity'
import { CategoriasMapper } from './mapper/categorias.mapper'

@Injectable()
export class CategoriasService {
  private readonly logger = new Logger(CategoriasService.name)

  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly categoriasMapper: CategoriasMapper,
  ) {}

  async findAll() {
    this.logger.log('Buscar todas categorias')
    const res = await this.categoriaRepository.find()
    return res
  }

  async findOne(id: string): Promise<Categoria> {
    this.logger.log(`Find one categoria by id:${id}`)
    const categoriaToFound = await this.categoriaRepository.findOneBy({ id })
    if (!categoriaToFound) {
      this.logger.log(`Categoria with id:${id} not found`)
      throw new NotFoundException(`Categoria con id ${id} no encontrada`)
    }
    return categoriaToFound
  }

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    this.logger.log(`Create categoria ${createCategoriaDto}`)
    const categoriaToCreate = this.categoriasMapper.toEntity(createCategoriaDto)
    const categoria = await this.exists(categoriaToCreate.nombre)

    if (categoria) {
      this.logger.log(`Categoria with name:${categoria.nombre} already exists`)
      throw new BadRequestException(
        `La categoria con nombre ${categoria.nombre} ya existe`,
      )
    }

    const res = await this.categoriaRepository.save({
      ...categoriaToCreate,
      id: uuidv4(),
    })
    return res
  }

  async update(
    id: string,
    updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<Categoria> {
    this.logger.log(`Update categoria by id:${id} - ${updateCategoriaDto}`)
    const categoryToUpdated = await this.findOne(id)

    if (updateCategoriaDto.nombre) {
      const categoria = await this.exists(updateCategoriaDto.nombre)
      if (categoria && categoria.id !== categoryToUpdated.id) {
        this.logger.log(`La categoria con nombre ${categoria.nombre} ya existe`)
        throw new BadRequestException(
          `La categoria con nombre ${categoria.nombre} ya existe`,
        )
      }
    }

    const res = await this.categoriaRepository.save({
      ...categoryToUpdated,
      ...updateCategoriaDto,
    })
    return res
  }

  async remove(id: string): Promise<Categoria> {
    this.logger.log(`Remove categoria by id:${id}`)
    const categoriaToRemove = await this.findOne(id)
    const res = await this.categoriaRepository.remove(categoriaToRemove)
    return res
  }

  async removeSoft(id: string): Promise<Categoria> {
    this.logger.log(`Remove categoria soft by id:${id}`)
    const categoriaToRemove = await this.findOne(id)
    const res = await this.categoriaRepository.save({
      ...categoriaToRemove,
      updatedAt: new Date(),
      isDeleted: true,
    })
    return res
  }

  public async exists(nombreCategoria: string): Promise<Categoria> {
    return await this.categoriaRepository
      .createQueryBuilder()
      .where('LOWER(nombre) = LOWER(:nombre)', {
        nombre: nombreCategoria.toLowerCase(),
      })
      .getOne()
  }
}
