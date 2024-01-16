import { INestApplication, NotFoundException } from '@nestjs/common'
import { Categoria } from '../../../src/rest/categorias/entities/categoria.entity'
import { Test, TestingModule } from '@nestjs/testing'
import { CategoriasController } from '../../../src/rest/categorias/categorias.controller'
import { CategoriasService } from '../../../src/rest/categorias/categorias.service'
import * as request from 'supertest'
import { Paginated } from 'nestjs-paginate'

describe('CategoriasController (e2e)', () => {
  let app: INestApplication
  const myEndpoint = `/categorias`

  const myCategoria: Categoria = {
    id: '7958ef01-9fe0-4f19-a1d5-79c917290ddf',
    nombre: 'nombre',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    funkos: [],
  }

  const createCategoriaDto = {
    nombre: 'nombre',
  }
  // Mock de servicio y sus metodos
  const mockCategoriasService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeSoft: jest.fn(),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CategoriasController],
      providers: [
        CategoriasService,
        { provide: CategoriasService, useValue: mockCategoriasService },
      ],
    })
      .overrideProvider(CategoriasService)
      .useValue(mockCategoriasService)
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /categorias', () => {
    it('should return an array of categorias', async () => {
      const testCategoria = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'categorias?page=1&limit=10&sortBy=nombre:ASC',
        },
      } as Paginated<Categoria>
      const options = {
        page: 1,
        limit: 10,
        path: 'categorias',
      }
      mockCategoriasService.findAll.mockResolvedValue([testCategoria])
      const { body } = await request(app.getHttpServer())
        .get(myEndpoint)
        .query(options)
        .expect(200)
      expect(() => {
        expect(body).toEqual([testCategoria])
        expect(mockCategoriasService.findAll).toHaveBeenCalled()
      })
    })
  })

  describe('GET /categorias/:id', () => {
    it('should return a single categoria', async () => {
      mockCategoriasService.findOne.mockResolvedValue(myCategoria)

      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}/${myCategoria.id}`)
        .expect(200)
      expect(() => {
        expect(body).toEqual(myCategoria)
        expect(mockCategoriasService.findOne).toHaveBeenCalled()
      })
    })

    it('should throw an error if the category does not exist', async () => {
      mockCategoriasService.findOne.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .get(`${myEndpoint}/${myCategoria.id}`)
        .expect(404)
    })
  })

  describe('POST /categorias', () => {
    it('should create a new categoria', async () => {
      mockCategoriasService.create.mockResolvedValue(myCategoria)

      const { body } = await request(app.getHttpServer())
        .post(myEndpoint)
        .send(createCategoriaDto)
        .expect(201)
      expect(() => {
        expect(body).toEqual(myCategoria)
        expect(mockCategoriasService.create).toHaveBeenCalledWith(
          createCategoriaDto,
        )
      })
    })
  })
  describe('PUT /categorias/:id', () => {
    it('should update a categoria', async () => {
      mockCategoriasService.update.mockResolvedValue(myCategoria)

      const { body } = await request(app.getHttpServer())
        .put(`${myEndpoint}/${myCategoria.id}`)
        .send(myCategoria)
        .expect(200)
      expect(() => {
        expect(body).toEqual(myCategoria)
        expect(mockCategoriasService.update).toHaveBeenCalledWith(
          myCategoria.id,
          myCategoria,
        )
      })
    })
  })
  describe('DELETE /categorias/:id', () => {
    it('should remove a categoria', async () => {
      mockCategoriasService.remove.mockResolvedValue(myCategoria)

      const { body } = await request(app.getHttpServer())
        .delete(`${myEndpoint}/${myCategoria.id}`)
        .expect(204)
      expect(() => {
        expect(body).toEqual(undefined)
        expect(mockCategoriasService.remove).toHaveBeenCalledWith(
          myCategoria.id,
        )
      })
    })
  })
})
