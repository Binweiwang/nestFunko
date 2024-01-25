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
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import { CacheKey, CacheTTL } from '@nestjs/cache-manager'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger'
import { ResponseFunkoDto } from './dto/response-funko.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard'

@Controller('funkos')
export class FunkoController {
  private readonly logger: Logger = new Logger(FunkoController.name)

  constructor(private readonly funkoService: FunkoService) {}

  @Get()
  @CacheKey('all_funkos')
  @CacheTTL(30)
  @ApiResponse({
    status: 200,
    description:
      'Lista de funkos paginada. Se puede filtrar por limite, pagina sortBy, filter y search',
    type: Paginated<ResponseFunkoDto>,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad de funkos por página',
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro de ordenación: campo:ASC|DESC',
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de busqueda: filter.campo = $eq:valor',
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de busqueda: search = valor',
    name: 'search',
    required: false,
    type: String,
  })
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log('Find all funkos')
    return await this.funkoService.findAll(query)
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'El funko con id indicado',
    type: ResponseFunkoDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del producto',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'funko no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del producto no es válido',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log('Find one funko')
    return await this.funkoService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Funko creado',
    type: ResponseFunkoDto,
  })
  @ApiBody({
    description: 'Datos del funko a crear',
    type: CreateFunkoDto,
  })
  @ApiBadRequestResponse({
    description:
      'El algunos de los campos no es válido según la especificación del DTO',
  })
  @ApiBadRequestResponse({
    description: 'La categoría no existe o no es válida',
  })
  async create(@Body() createFunkoDto: CreateFunkoDto) {
    this.logger.log('Create funko')
    return await this.funkoService.create(createFunkoDto)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Funko actualizado',
    type: ResponseFunkoDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del funko',
    type: Number,
  })
  @ApiBody({
    description: 'Datos del funko a actualizar',
    type: UpdateFunkoDto,
  })
  @ApiNotFoundResponse({
    description: 'Funko no encontrado',
  })
  @ApiBadRequestResponse({
    description:
      'El algunos de los campos no es válido según la especificación del DTO',
  })
  @ApiBadRequestResponse({
    description: 'La categoría no existe o no es válida',
  })
  async update(
    @Param('id') id: number,
    @Body() updateFunkoDto: UpdateFunkoDto,
  ) {
    this.logger.log(`Update funko ${updateFunkoDto}`)
    return await this.funkoService.update(id, updateFunkoDto)
  }

  @Patch('/imagen/:id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Imagen actualizada',
    type: ResponseFunkoDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del producto',
    type: Number,
  })
  @ApiProperty({
    name: 'file',
    description: 'Fichero de imagen',
    type: 'string',
    format: 'binary',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fichero de imagen',
    type: FileInterceptor('file'),
  })
  @ApiNotFoundResponse({
    description: 'Producto no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del producto no es válido',
  })
  @ApiBadRequestResponse({
    description: 'El fichero no es válido o de un tipo no soportado',
  })
  @ApiBadRequestResponse({
    description: 'El fichero no puede ser mayor a 1 megabyte',
  })
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
    this.logger.log(`Update image funko ${id}`)
    return await this.funkoService.updateImage(id, file, req, true)
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Funko eliminado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del funko',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Funko no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del Funko no es válido',
  })
  async remove(@Param('id') id: number) {
    this.logger.log(`Remove funko ${id}`)
    this.funkoService.removeSoft(id)
    return await HttpStatus.NO_CONTENT
  }
}
