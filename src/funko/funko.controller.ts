import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Put,
  ParseIntPipe,
  Logger,
} from '@nestjs/common'
import { FunkoService } from './funko.service'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'

@Controller('funko')
export class FunkoController {
  private readonly logger: Logger = new Logger(FunkoController.name)
  constructor(private readonly funkoService: FunkoService) {}

  @Post()
  @HttpCode(201)
  create(@Body() createFunkoDto: CreateFunkoDto) {
    this.logger.log('Crear un funko desde el controlador')
    return this.funkoService.create(createFunkoDto)
  }

  @Get()
  findAll() {
    this.logger.log('Buscar todos los funkos desde el controlador')
    return this.funkoService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log('Buscar un funko desde el controlador')
    return this.funkoService.findOne(id)
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateFunkoDto: UpdateFunkoDto) {
    this.logger.log('Actualizar un funko desde el controlador')
    return this.funkoService.update(id, updateFunkoDto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: number) {
    this.logger.log('Eliminar un funko desde el controlador')
    this.funkoService.remove(id)
    return HttpStatus.NO_CONTENT
  }
}
