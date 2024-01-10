export class FunkoNotificacionDto {
  constructor(
    public id: number,
    public nombre: string,
    public imagen: string,
    public cantidad: number,
    public categoria: string,
    public isDeleted: boolean,
    public createdAt: string,
    public updatedAt: string,
  ) {}
}
