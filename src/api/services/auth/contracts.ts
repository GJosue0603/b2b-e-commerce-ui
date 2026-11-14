export interface ApiRegistrationRequest {
  readonly nombre: string
  readonly apellido1: string
  readonly apellido2: string
  readonly correo: string
  readonly contrasena: string
  readonly telefono: string
}

export interface ApiLoginRequest {
  readonly correo: string
  readonly contrasena: string
}

export interface ApiEmailVerificationRequest {
  readonly correo: string
  readonly codigo: string
}

export type ApiResendCodeRequest = string
