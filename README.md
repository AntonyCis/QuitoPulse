<div align="center">

# Radar Quito

**Plataforma ciudadana de reportes geolocalizados para Quito, Ecuador**

![Landing Page](docs/landing-preview.png)

</div>

---

## Que es Radar Quito?

Radar Quito es una plataforma web que permite a los ciudadanos reportar incidentes en su ciudad de forma geolocalizada. Los reportes se visualizan en un mapa interactivo y pasan por un proceso de verificacion comunitaria antes de ser atendidos.

## Funcionalidades

| Modulo | Descripcion |
|--------|-------------|
| **Mapa interactivo** | Mapa con MapLibre GL y basemap CARTO Dark. Navega, haz zoom y explora incidentes en tiempo real. |
| **Reportes ciudadanos** | Crea reportes con titulo, descripcion, categoria, prioridad y ubicacion exacta. |
| **Verificacion social** | La comunidad confirma reportes. Mas confirmaciones = mayor prioridad. |
| **Comentarios** | Discute y agrega contexto a los reportes. |
| **Categorias** | Robo, bache, iluminacion, basura, ruido, y mas. |
| **Filtros** | Filtra reportes por categoria directamente desde el mapa. |
| **Notificaciones Push** | Recibe alertas cuando un reporte en tu zona cambia de estado. |
| **Panel de administracion** | Dashboard con estadisticas, moderacion de reportes y gestion de usuarios. |
| **Autenticacion JWT** | Registro, login y sesiones seguras con refresh token. |
| **Validacion Zod** | Todas las entradas validadas con schemas compartidos. |
| **Testing** | 39 tests (API + validacion) con Vitest. |

## Stack tecnico

```
Frontend    React, Vite, Tailwind CSS, MapLibre GL, TanStack Query, GSAP
Backend     NestJS, Drizzle ORM, PostgreSQL + PostGIS, Vitest
Admin       React, Vite, Tailwind CSS
Paquetes    @radar-quito/validation, @radar-quito/types
Infra       pnpm workspaces, Turborepo, Docker (PostgreSQL)
```

## Estructura del proyecto

```
radar-quito/
  apps/
    web/          # App principal (React + Vite)
    api/          # Backend (NestJS)
    admin/        # Panel de administracion (React + Vite)
  packages/
    validation/   # Schemas Zod compartidos
    types/        # Tipos TypeScript compartidos
```

## Requisitos

- Node.js >= 22
- pnpm >= 11
- Docker (para PostgreSQL)

## Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/radar-quito.git
cd radar-quito

# Instalar dependencias
pnpm install

# Levantar PostgreSQL
docker compose up -d

# Configurar variables de entorno
cp apps/api/.env.example apps/api/.env

# Generar migraciones y hacer push a la DB
pnpm db:generate
pnpm db:push

# Sembrar datos iniciales (categorias, admin)
pnpm --filter @radar-quito/api db:seed

# Iniciar en modo desarrollo
pnpm dev
```

## URLs en desarrollo

| App | URL |
|-----|-----|
| Landing / Mapa | http://localhost:5173 |
| API | http://localhost:3000 |
| Admin | http://localhost:5174 |

## Variables de entorno

Ver `apps/api/.env.example` para la referencia completa.

```
DATABASE_URL=postgresql://radarquito:radarquito123@localhost:5432/radarquito
JWT_SECRET=tu-secreto-jwt
JWT_REFRESH_SECRET=tu-secreto-refresh
CORS_ORIGIN=http://localhost:5173
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

## Comandos utiles

```bash
pnpm dev              # Iniciar todos los servicios
pnpm build            # Build de produccion
pnpm typecheck        # Verificar tipos
pnpm test             # Ejecutar tests
pnpm lint             # Linter
pnpm db:studio        # Abrir Drizzle Studio (UI de la DB)
```

## Licencia

MIT

---

<div align="center">
Hecho con dedicacion para Quito
</div>
