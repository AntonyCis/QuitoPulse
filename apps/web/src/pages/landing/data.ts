import { Q } from '../../lib/colors';

export const QUITO_COLORS = Q;

export const features = [
  {
    icon: 'map',
    accent: 'secondary' as const,
    title: 'Mapa en Vivo',
    desc: 'Visualiza el estado de la ciudad con datos filtrados y precisos al momento, diseñados para una lectura rápida sin saturación visual.',
  },
  {
    icon: 'notifications_active',
    accent: 'primary' as const,
    title: 'Alertas Inteligentes',
    desc: 'Recibe notificaciones focalizadas de eventos críticos en tu radar personal, manteniendo el control de tu entorno.',
  },
  {
    icon: 'groups',
    accent: 'tertiary' as const,
    title: 'Comunidad Activa',
    desc: 'Reportes validados por usuarios en la zona aseguran que la información sea relevante, actual y confiable.',
  },
];

export const secondaryFeatures = [
  { icon: 'verified', label: 'Moderación activa de cada reporte' },
  { icon: 'query_stats', label: 'Estadísticas públicas por zona y categoría' },
  { icon: 'lock', label: 'Privacidad primero: tus datos protegidos' },
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
