// lib/prisma.ts

console.log("--- সার্ভার চালু হচ্ছে ---");
console.log("Prisma যে DATABASE_URL টি পড়ছে:", process.env.DATABASE_URL);
console.log("--- --- ---");
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;