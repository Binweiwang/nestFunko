import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FunkoService } from './funko.service'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { FunkoExistsGuard } from './guards/funko-exists.guard'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, parse } from 'path'
import { Request } from 'express'
import { Paginate, PaginateQuery } from 'nestjs-paginate'

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
  async findAll(@Paginate() query: PaginateQuery) {
    return await this.funkoService.findAll(query)
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

  @Patch('/imagen/:id')
  @UseGuards(FunkoExistsGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR || './storage-dir',
        filename: (req, file, cb) => {
          const { name } = parse(file.originalname)
          const fileName = `${Date.now()}_${name.replace(/\s/g, '')}`
          const fileExt = extname(file.originalname)
          cb(null, `${fileName}${fileExt}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif']
        const maxFileSize = 1024 * 1024 // 1 megabyte
        if (!allowedMimes.includes(file.mimetype)) {
          // Note: You can customize this error message to be more specific
          cb(
            new BadRequestException(
              'Fichero no soportado. No es del tipo imagen válido',
            ),
            false,
          )
        } else if (file.size > maxFileSize) {
          cb(
            new BadRequestException(
              'El tamaño del archivo no puede ser mayor a 1 megabyte.',
            ),
            false,
          )
        } else {
          cb(null, true)
        }
      },
    }),
  )
  async updateImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return await this.funkoService.updateImage(id, file, req, true)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: number) {
    this.funkoService.removeSoft(id)
    return await HttpStatus.NO_CONTENT
  }
}
