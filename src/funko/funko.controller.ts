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

@Controller('funkos')
export class FunkoController {
  private readonly logger: Logger = new Logger(FunkoController.name)
  constructor(private readonly funkoService: FunkoService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createFunkoDto: CreateFunkoDto) {
    return await this.funkoService.create(createFunkoDto)
  }

  @Get()
  async findAll() {
    return await this.funkoService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.funkoService.findOne(id)
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateFunkoDto: UpdateFunkoDto,
  ) {
    return await this.funkoService.update(id, updateFunkoDto)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: number) {
    this.funkoService.removeSoft(id)
    return await HttpStatus.NO_CONTENT
  }
}
