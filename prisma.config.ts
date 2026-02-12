import { defineConfig } from '@prisma/config';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const client = createClient({ url: 'file:app.db' });
const adapter = new PrismaLibSQL(client);

export default defineConfig({
    schema: 'prisma/schema.prisma',
    adapter,
});
