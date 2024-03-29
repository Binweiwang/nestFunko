import { INestApplication } from '@nestjs/common'
import { ResponseFunkoDto } from '../../../src/rest/funko/dto/response-funko.dto'
import { Test, TestingModule } from '@nestjs/testing'
import { FunkoController } from '../../../src/rest/funko/funko.controller'
import { FunkoService } from '../../../src/rest/funko/funko.service'
import * as request from 'supertest'
import { Paginated } from 'nestjs-paginate'
import { Funko } from '../../../src/rest/funko/entities/funko.entity'

describe('FunkosController (e2e)', () => {
  let app: INestApplication
  const myEndpoint = `/funkos`
  const myFunkoResponse: ResponseFunkoDto = {
    id: 1,
    nombre: 'nombre',
    cantidad: 10,
    imagen: 'imagen',
    categoria: 'categoria-test',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: false,
  }
  const createFunkoDto = {
    nombre: 'nombre',
    cantidad: 10,
    imagen: 'imagen',
    categoria: 'categoria-test',
  }
  const updateFunkoDto = {
    nombre: 'nombre',
    cantidad: 10,
    imagen: 'imagen',
    categoria: 'categoria-test',
    isActive: false,
  }
  const mockFunkosService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeSoft: jest.fn(),
    exists: jest.fn(),
    updateImage: jest.fn(),
  }
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FunkoController],
      providers: [
        FunkoService,
        { provide: FunkoService, useValue: mockFunkosService },
      ],
    }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()
  })
  afterAll(async () => {
    await app.close()
  })
  describe('GET /funkos', () => {
    it('should return an array of funkos', async () => {
      const testFunkos = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'funkos?page=1&limit=10&sortBy=nombre:ASC',
        },
      } as Paginated<Funko>
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'funkos',
      }
      mockFunkosService.findAll.mockResolvedValue([testFunkos])
      const { body } = await request(app.getHttpServer())
        .get(myEndpoint)
        .query(paginateOptions)
        .expect(200)
      expect(() => {
        expect(body).toEqual([myFunkoResponse])
        expect(mockFunkosService.findAll).toHaveBeenCalled()
      })
    })
  })
  describe('GET /funkos/:id', () => {
    it('should return a single funko', async () => {
      mockFunkosService.findOne.mockResolvedValue(myFunkoResponse)
      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}/${myFunkoResponse.id}`)
        .expect(200)
      expect(() => {
        expect(body).toEqual(myFunkoResponse)
        expect(mockFunkosService.findOne).toHaveBeenCalled()
      })
    })
  })
  describe('POST /funkos', () => {
    it('should create a funko', async () => {
      mockFunkosService.create.mockResolvedValue(myFunkoResponse)
      const { body } = await request(app.getHttpServer())
        .post(myEndpoint)
        .send(createFunkoDto)
        .expect(201)
      expect(() => {
        expect(body).toEqual(myFunkoResponse)
        expect(mockFunkosService.create).toHaveBeenCalledWith(createFunkoDto)
      })
    })
  })
  describe('PUT /funkos/:id', () => {
    it('should update a funko', async () => {
      mockFunkosService.update.mockResolvedValue(myFunkoResponse)
      const { body } = await request(app.getHttpServer())
        .put(`${myEndpoint}/${myFunkoResponse.id}`)
        .send(updateFunkoDto)
        .expect(200)
      expect(() => {
        expect(body).toEqual(myFunkoResponse)
        expect(mockFunkosService.update).toHaveBeenCalledWith(
          myFunkoResponse.id,
          updateFunkoDto,
        )
      })
    })
  })
  describe('DELETE /funkos/:id', () => {
    it('should delete a funko', async () => {
      mockFunkosService.remove.mockResolvedValue(myFunkoResponse)
      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${myFunkoResponse}`)
        .expect(204)
    })
    it('should soft delete a funko', async () => {
      mockFunkosService.removeSoft.mockResolvedValue(myFunkoResponse)
      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${myFunkoResponse}`)
        .expect(204)
    })
  })
  describe('PATCH /funkos/imagen/:id', () => {
    it('should update the product image', async () => {
      const file = new Buffer('file')

      mockFunkosService.exists.mockResolvedValue(true)
      mockFunkosService.updateImage.mockResolvedValue(myFunkoResponse)

      await request(app.getHttpServer())
        .patch(`${myEndpoint}/imagen/${myFunkoResponse.id}`)
        .attach('file', file, 'image.jpg')
        .set('Content-Type', 'multipart/form-data')
        .expect(200)
    })
  })
})
