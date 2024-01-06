import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { Funko } from './entities/funko.entity'
import { FunkoMapper } from './mapper/funko.nestfunkomapper'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Categoria } from '../categorias/entities/categoria.entity'
import { ResponseFunkoDto } from './dto/response-funko.dto'

@Injectable()
export class FunkoService {
  private readonly logger: Logger = new Logger(FunkoService.name)
  constructor(
    private readonly nestFunkoMapper: FunkoMapper,
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  async create(createFunkoDto: CreateFunkoDto) {
    this.logger.log('Crear un funko')

    const categoria = await this.checkCategoria(createFunkoDto.categoria)
    const funko = this.nestFunkoMapper.toFunko(createFunkoDto, categoria)
    const savedFunko = await this.funkoRepository.save(funko)
    return this.nestFunkoMapper.funkoToResponseFunkoDto(savedFunko)
  }

  public async checkCategoria(nombreCategoria: string): Promise<Categoria> {
    const categoria = await this.categoriaRepository
      .createQueryBuilder()
      .where('LOWER(nombre) = LOWER(:nombre)', {
        nombre: nombreCategoria.toLowerCase(),
      })
      .getOne()

    if (!categoria) {
      throw new BadRequestException(`La categoria ${nombreCategoria} no existe`)
    }

    return categoria
  }

  async findAll() {
    this.logger.log('Buscar todos los funkos')
    return this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .getMany()
  }
  async findOne(id: number) {
    this.logger.log('Buscar un funko')
    const foundFunko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .where('funko.id = :id', { id })
      .getOne()
    if (!foundFunko) {
      throw new NotFoundException(`Funko no encontrado ${id} no existe`)
    }
    return this.nestFunkoMapper.funkoToResponseFunkoDto(foundFunko)
  }

  async update(
    id: number,
    updateFunkoDto: UpdateFunkoDto,
  ): Promise<ResponseFunkoDto> {
    this.logger.log('Actualizar un funko')

    // Espera a que se resuelva la Promesa antes de continuar
    const funkoToUpdate = await this.findOne(id)
    let categoria: Categoria
    if (updateFunkoDto.categoria) {
      categoria = await this.checkCategoria(updateFunkoDto.categoria)
    } else {
      categoria = await this.checkCategoria(funkoToUpdate.categoria)
    }
    const funkoUpdated = await this.funkoRepository.save({
      ...funkoToUpdate,
      ...updateFunkoDto,
      categoria,
    })
    return this.nestFunkoMapper.funkoToResponseFunkoDto(funkoUpdated)
  }

  async remove(id: number) {
    this.logger.log('Eliminar un funko')
    const funkoToRemove = await this.exists(id)
    return this.funkoRepository.remove(funkoToRemove)
  }
  async removeSoft(id: number) {
    this.logger.log('Eliminar un funko')
    const funkoToRemove = await this.exists(id)
    funkoToRemove.isDeleted = true
    return this.funkoRepository.save(funkoToRemove)
  }

  public async exists(id: number): Promise<Funko> {
    const funko = await this.funkoRepository.findOneBy({ id })
    if (!funko) {
      throw new BadRequestException(`Funko no encontrado ${id} no existe`)
    }
    return funko
  }
}
