import type { Categoria } from '../../domain'
import { fixtureIds } from './ids'
import { colaboradores } from './usuarios'

export const categorias = [
  {
    id: fixtureIds.categories.office,
    nombre: 'Accesorios de oficina',
    descripcion: 'Periféricos y accesorios para espacios de trabajo.',
    activo: true,
    creadoPor: colaboradores.vendedor,
    fechaCreacion: '2026-01-05T14:00:00.000Z',
  },
  {
    id: fixtureIds.categories.monitors,
    nombre: 'Monitores',
    descripcion: 'Pantallas para trabajo, estudio y entretenimiento.',
    activo: true,
    creadoPor: colaboradores.vendedor,
    fechaCreacion: '2026-01-05T14:05:00.000Z',
  },
  {
    id: fixtureIds.categories.audio,
    nombre: 'Audio',
    descripcion: 'Dispositivos de audio para uso cotidiano y profesional.',
    activo: true,
    creadoPor: colaboradores.vendedor,
    fechaCreacion: '2026-01-05T14:10:00.000Z',
  },
  {
    id: fixtureIds.categories.video,
    nombre: 'Videoconferencia',
    descripcion: 'Cámaras y accesorios para comunicación remota.',
    activo: true,
    creadoPor: colaboradores.vendedor,
    fechaCreacion: '2026-01-05T14:15:00.000Z',
  },
] as const satisfies readonly Categoria[]
