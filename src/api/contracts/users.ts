export interface ApiUser {
  readonly id: string
  readonly nombre: string
  readonly apellido1: string
  readonly apellido2: string
  readonly correo: string
  readonly telefono: string
  readonly rol: string
  readonly activo: boolean
  readonly fechaCreacion: string
  readonly fechaActualizacion: string
}
