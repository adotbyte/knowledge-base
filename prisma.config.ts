import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Naudojame process.env, kad išvengtume klaidų, jei .env dar neįkeltas
    url: process.env.DATABASE_URL || '',
  },
});