import { render, screen, waitFor, within } from '@testing-library/react'
import { StrictMode } from 'react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { API_SESSION_STORAGE_KEY, clearApiAccessToken, getApiAccessToken } from '../../api/access-token-store'
import { renderTestApp } from '../../test/renderApp'
import { AuthProvider } from './state/AuthProvider'
import { useAuth } from './state/useAuth'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}

function createToken(role = 'COMPRADOR', exp = Math.floor(Date.now() / 1000) + 60) {
  const encode = (value: string) =>
    btoa(value).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${encode('{"alg":"none"}')}.${encode(
    JSON.stringify({
      activo: true,
      email: 'buyer@example.test',
      exp,
      rol: role,
      sub: 'user-api-1',
    }),
  )}.signature`
}

function mockFetch(...responses: Response[]) {
  const requests: { readonly input: RequestInfo | URL; readonly init?: RequestInit }[] =
    []
  vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    requests.push({ input, init })
    const response = responses.shift()
    if (!response) throw new Error('No se configuró respuesta para la solicitud.')
    return response
  })
  return requests
}

function SessionProbe() {
  const { signIn, user } = useAuth()
  return (
    <>
      <button
        onClick={() => void signIn('buyer@example.test', 'Clave1234')}
        type="button"
      >
        Iniciar sesión de prueba
      </button>
      <span>{user?.id ?? 'Sesión cerrada'}</span>
    </>
  )
}

afterEach(() => {
  clearApiAccessToken()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('flujo de autenticación en modo API', () => {
  it('conserva el menú y la sesión del administrador al ir a la tienda desde el logo', async () => {
    vi.stubEnv('VITE_AUTH_MODE', 'api')
    vi.stubEnv('VITE_CATALOG_DATA_MODE', 'demo')
    vi.stubEnv('VITE_CART_DATA_MODE', 'demo')
    const token = createToken('ADMINISTRADOR')
    sessionStorage.setItem(API_SESSION_STORAGE_KEY, JSON.stringify({ token, expiresAt: Date.now() + 60_000 }))
    const user = userEvent.setup()
    const { router } = renderTestApp('/admin/cuenta')
    await screen.findByRole('heading', { name: 'Mi cuenta' })
    await user.click(screen.getByRole('link', { name: 'NexoTech' }))
    expect(router.state.location.pathname).toBe('/')
    const header = screen.getByRole('banner')
    expect(within(header).getByRole('link', { name: /Carrito,/ })).toHaveAttribute('href', '/carrito')
    const navigation = within(header).getByRole('navigation', { name: 'Navegación de Administrador' })
    expect(within(navigation).getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/')
    expect(within(navigation).getByRole('link', { name: 'Catálogo' })).toHaveAttribute('href', '/catalogo')
    await user.click(within(navigation).getByRole('button', { name: 'Administración' }))
    expect(within(navigation).getByRole('link', { name: 'Usuarios' })).toHaveAttribute('href', '/admin/usuarios')
    expect(within(navigation).getByRole('link', { name: 'Productos' })).toHaveAttribute('href', '/admin/productos')
    const profile = within(header).getByRole('button', { name: 'Cuenta de Administrador' })
    await user.click(profile)
    expect(getApiAccessToken()).toBe(token)
    expect(router.state.location.pathname).toBe('/')
    const accountMenu = profile.closest<HTMLDivElement>('.account-menu')!
    await user.click(within(accountMenu).getByRole('link', { name: 'Ver cuenta' }))
    expect(router.state.location.pathname).toBe('/admin/cuenta')
    expect(getApiAccessToken()).toBe(token)
  })

  it('restaura la sesión guardada al montar, incluso en StrictMode', () => {
    vi.stubEnv('VITE_AUTH_MODE', 'api')
    const token = createToken()
    sessionStorage.setItem(API_SESSION_STORAGE_KEY, JSON.stringify({ token, expiresAt: Date.now() + 60_000 }))
    const view = render(<StrictMode><AuthProvider><SessionProbe /></AuthProvider></StrictMode>)
    expect(screen.getByText('user-api-1')).toBeVisible()
    expect(getApiAccessToken()).toBe(token)
    view.unmount()
    render(<AuthProvider><SessionProbe /></AuthProvider>)
    expect(screen.getByText('user-api-1')).toBeVisible()
  })

  it('descarta un JWT corrupto guardado al restaurar', () => {
    vi.stubEnv('VITE_AUTH_MODE', 'api')
    sessionStorage.setItem(API_SESSION_STORAGE_KEY, JSON.stringify({ token: 'invalido', expiresAt: Date.now() + 60_000 }))
    render(<AuthProvider><SessionProbe /></AuthProvider>)
    expect(screen.getByText('Sesión cerrada')).toBeVisible()
    expect(getApiAccessToken()).toBeNull()
  })

  it('registra, reenvía código y verifica correo sin iniciar sesión automáticamente', async () => {
    vi.stubEnv('VITE_AUTH_MODE', 'api')
    const requests = mockFetch(
      jsonResponse('Código enviado.', 201),
      jsonResponse('Código reenviado.'),
      jsonResponse({
        activo: true,
        apellido1: 'Vargas',
        apellido2: 'Mora',
        correo: 'lucia@example.test',
        fechaCreacion: '2026-01-01T00:00:00Z',
        id: 'user-api-2',
        nombre: 'Lucía',
        rol: 'COMPRADOR',
        telefono: '+506 8888-7777',
      }),
    )
    const user = userEvent.setup()
    renderTestApp('/registro')

    await user.type(screen.getByLabelText(/^Nombre/), 'Lucía')
    await user.type(screen.getByLabelText(/Primer apellido/), 'Vargas')
    await user.type(screen.getByLabelText(/Segundo apellido/), 'Mora')
    await user.type(
      screen.getByLabelText(/Correo electrónico/),
      'lucia@example.test',
    )
    await user.type(screen.getByLabelText(/Teléfono/), '+506 8888-7777')
    await user.type(screen.getByLabelText(/^Contraseña/), 'Clave1234')
    await user.type(screen.getByLabelText(/Confirmar contraseña/), 'Clave1234')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Código enviado.')).toBeVisible()
    expect(await screen.findByLabelText(/Código de verificación/)).toBeVisible()
    expect(screen.queryByLabelText(/^Contraseña/)).toBeNull()
    expect(requests[0]?.init?.body).toContain('"contrasena":"Clave1234"')
    expect(getApiAccessToken()).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Reenviar código' }))
    expect(await screen.findByText('Código reenviado.')).toBeVisible()
    expect(requests[1]?.init?.body).toBe(JSON.stringify('lucia@example.test'))

    await user.type(screen.getByLabelText(/Código de verificación/), '123456')
    await user.click(screen.getByRole('button', { name: 'Verificar correo' }))
    expect(await screen.findByText('Correo verificado')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Ir a iniciar sesión' })).toBeVisible()
    expect(getApiAccessToken()).toBeNull()
    expect(requests.map(({ input }) => String(input))).toEqual([
      expect.stringContaining('/autenticacion/registrar'),
      expect.stringContaining('/autenticacion/reenviar-codigo'),
      expect.stringContaining('/autenticacion/verificar-correo'),
    ])
  })

  it('acepta el JWT string, mapea el rol y restringe rutas de otro rol', async () => {
    vi.stubEnv('VITE_AUTH_MODE', 'api')
    const token = createToken()
    const requests = mockFetch(jsonResponse(token))
    const user = userEvent.setup()
    const { router } = renderTestApp('/ingresar')

    await user.type(
      screen.getByLabelText(/Correo electrónico/),
      'buyer@example.test',
    )
    await user.type(screen.getByLabelText(/Contraseña/), 'Clave1234')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(
      await screen.findByRole('heading', {
        name: 'Tecnología para tu día a día y tu negocio',
      }),
    ).toBeVisible()
    expect(getApiAccessToken()).toBe(token)
    expect(requests[0]?.init?.body).toBe(
      JSON.stringify({
        contrasena: 'Clave1234',
        correo: 'buyer@example.test',
      }),
    )

    await router.navigate('/vendedor/productos')
    expect(await screen.findByText('El backend también debe validar el token y autorizar cada operación.')).toBeVisible()
  })

  it('no autentica ni usa mocks cuando la API rechaza el login', async () => {
    vi.stubEnv('VITE_AUTH_MODE', 'api')
    const requests = mockFetch(jsonResponse('Credenciales no válidas.', 401))
    const user = userEvent.setup()
    const { router } = renderTestApp('/ingresar')

    await user.type(
      screen.getByLabelText(/Correo electrónico/),
      'buyer@example.test',
    )
    await user.type(screen.getByLabelText(/Contraseña/), 'Wrong1234')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('El correo o la contraseña no son correctos.')).toBeVisible()
    expect(router.state.location.pathname).toBe('/ingresar')
    expect(getApiAccessToken()).toBeNull()
    expect(requests).toHaveLength(1)
  })

  it('rechaza tokens expirados que devuelve la API', async () => {
    vi.stubEnv('VITE_AUTH_MODE', 'api')
    mockFetch(jsonResponse(createToken('COMPRADOR', 1)))
    const user = userEvent.setup()
    renderTestApp('/ingresar')

    await user.type(
      screen.getByLabelText(/Correo electrónico/),
      'buyer@example.test',
    )
    await user.type(screen.getByLabelText(/Contraseña/), 'Clave1234')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('La sesión de la API ya expiró.')).toBeVisible()
    expect(getApiAccessToken()).toBeNull()
  })

  it('cierra la sesión en memoria al vencer el JWT', async () => {
    vi.stubEnv('VITE_AUTH_MODE', 'api')
    mockFetch(jsonResponse(createToken('COMPRADOR', Math.floor(Date.now() / 1000) + 2)))
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Iniciar sesión de prueba' }))
    expect(await screen.findByText('user-api-1')).toBeVisible()

    await waitFor(
      () => expect(screen.getByText('Sesión cerrada')).toBeVisible(),
      { timeout: 5_000 },
    )
    expect(getApiAccessToken()).toBeNull()
  })
})
