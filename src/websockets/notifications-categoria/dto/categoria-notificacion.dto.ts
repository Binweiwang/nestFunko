export class CategoriaNotificacionDto {
  constructor(
    public id: number,
    public nombre: string,
    public isDeleted: boolean,
    public createdAt: string,
    public updatedAt: string,
  ) {}
}
