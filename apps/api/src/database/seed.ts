import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { categories } from '../lib/drizzle/schema';

const CATEGORIES = [
  { name: 'TRAFFIC', label: 'Tráfico', color: '#FF6B35', icon: 'traffic', sortOrder: 0 },
  { name: 'ACCIDENT', label: 'Accidente', color: '#E63946', icon: 'accident', sortOrder: 1 },
  { name: 'ROAD_CLOSURE', label: 'Cierre de Vía', color: '#FFB627', icon: 'road-closure', sortOrder: 2 },
  { name: 'CONSTRUCTION', label: 'Obra', color: '#2A9D8F', icon: 'construction', sortOrder: 3 },
  { name: 'EVENT', label: 'Evento', color: '#457B9D', icon: 'event', sortOrder: 4 },
  { name: 'PUBLIC_SAFETY', label: 'Seguridad', color: '#6A0572', icon: 'public-safety', sortOrder: 5 },
  { name: 'URBAN_PROBLEM', label: 'Problema Urbano', color: '#8D99AE', icon: 'urban-problem', sortOrder: 6 },
  { name: 'OTHER', label: 'Otro', color: '#ADB5BD', icon: 'other', sortOrder: 7 },
];

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  console.log('🌱 Seeding categories...');

  try {
    for (const category of CATEGORIES) {
      await db
        .insert(categories)
        .values(category)
        .onConflictDoNothing({ target: categories.name });
      console.log(`  ✅ ${category.label}`);
    }
    console.log('🌱 Seed completed successfully');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
