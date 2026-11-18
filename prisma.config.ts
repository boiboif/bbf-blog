import { loadEnvConfig } from '@next/env'
import { defineConfig } from 'prisma/config'

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production')

export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: { url: process.env.DATABASE_URL },
})
