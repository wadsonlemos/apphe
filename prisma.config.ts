import { defineConfig } from '@prisma/config';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    // @ts-ignore
    adapter: async () => {
        const { PrismaLibSQL } = await import('@prisma/adapter-libsql');
        const { createClient } = await import('@libsql/client');
        const client = createClient({ url: 'file:app.db' });
        return new PrismaLibSQL(client);
    }
});
