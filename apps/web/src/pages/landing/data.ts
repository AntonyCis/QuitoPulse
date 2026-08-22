import { Q } from '../../lib/colors';

export const QUITO_COLORS = Q;

export const features = [
  {
    icon: 'map',
    title: 'Mapa en Tiempo Real',
    desc: 'Visualiza incidentes geolocalizados en un mapa interactivo de Quito. Navega por zonas, filtra por categoría y descubre lo que sucede en tu ciudad.',
  },
  {
    icon: 'shield',
    title: 'Moderación Activa',
    desc: 'Cada reporte pasa por un proceso de verificación. Nuestros moderadores revisan y validan la información antes de que se publique.',
  },
  {
    icon: 'check',
    title: 'Verificación Social',
    desc: 'La comunidad confirma y comenta los reportes. Más confirmaciones significan mayor prioridad y atención de las autoridades.',
  },
  {
    icon: 'bell',
    title: 'Notificaciones Push',
    desc: 'Recibe alertas cuando un reporte en tu zona cambia de estado. Mantente informado sin revisar la app constantemente.',
  },
  {
    icon: 'chart',
    title: 'Estadísticas Públicas',
    desc: 'Accede a datos agregados sobre incidentes por zona, categoría y tendencias temporales. Información que impulsa mejores decisiones.',
  },
  {
    icon: 'lock',
    title: 'Datos Seguros',
    desc: 'Tus reportes son anónimos por defecto. La plataforma cumple con estándares de seguridad y privacidad de datos.',
  },
];

export const stats = [
  { value: '12K+', label: 'Reportes Verificados' },
  { value: '8.5K', label: 'Ciudadanos Activos' },
  { value: '340+', label: 'Zonas Cubiertas' },
  { value: '94%', label: 'Tasa de Resolución' },
];

export const steps = [
  {
    num: '01',
    title: 'Crea tu cuenta',
    desc: 'Regístrate en segundos con tu email. Sin verificación complicada.',
  },
  {
    num: '02',
    title: 'Reporta el incidente',
    desc: 'Selecciona la categoría, ubica el punto en el mapa y añade una descripción.',
  },
  {
    num: '03',
    title: 'La comunidad valida',
    desc: 'Otros ciudadanos confirman y aportan información adicional al reporte.',
  },
  {
    num: '04',
    title: 'Se resuelve',
    desc: 'Las autoridades y moderadores atienden los reportes con mayor prioridad.',
  },
];
