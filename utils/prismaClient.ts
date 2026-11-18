import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@/generated/prisma/client'
import { mysqlOptions } from '@/prisma/mysql-options'

const prismaGlobal = globalThis as typeof globalThis & { prisma?: PrismaClient }
const prisma = prismaGlobal.prisma ?? new PrismaClient({ adapter: new PrismaMariaDb(mysqlOptions(process.env.DATABASE_URL)) })
if (process.env.NODE_ENV !== 'production') prismaGlobal.prisma = prisma

export default prisma
