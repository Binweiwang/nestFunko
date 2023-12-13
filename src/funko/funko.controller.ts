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
} from '@nestjs/common'
import { FunkoService } from './funko.service'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'

@Controller('funko')
export class FunkoController {
  constructor(private readonly funkoService: FunkoService) {}

  @Post()
  @HttpCode(201)
  create(@Body() createFunkoDto: CreateFunkoDto) {
    return this.funkoService.create(createFunkoDto)
  }

  @Get()
  findAll() {
    return this.funkoService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.funkoService.findOne(id)
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateFunkoDto: UpdateFunkoDto) {
    return this.funkoService.update(id, updateFunkoDto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: number) {
    this.funkoService.remove(id)
    return HttpStatus.NO_CONTENT
  }
}
