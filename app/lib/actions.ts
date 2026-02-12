'use server';

// Consolidated imports
import { signIn, signOut, auth } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/app/lib/db';
import { revalidatePath } from 'next/cache';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

const CreateEntrySchema = z.object({
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    description: z.string().optional(),
});

export async function testConnection() {
    return { success: true, message: "Conexão com servidor OK!" };
}

export async function createEntry(formData: FormData) {
    console.log("DEBUG: createEntry started"); // Debug log

    // 1. Immediate Ping check (Pre-Auth) to test server reachability
    const description = formData.get('description') as string;
    if (description === 'Ping') {
        return { success: true, message: 'Pong: Server is reachable (Pre-Auth)' };
    }

    try {
        const session = await auth();
        console.log("DEBUG: Session retrieved", session?.user?.email); // Debug log

        if (!session?.user) {
            console.log("DEBUG: No session");
            return { success: false, message: 'User not authenticated' };
        }

        // Admins can specify a username (targetUser), regular users use their own
        // Fallback to session.user.username, NOT name (which might be different)
        const sessionUsername = session.user.username || session.user.name;
        const targetUsername = formData.get('targetUsername') as string || sessionUsername!;

        console.log("DEBUG: Target Username:", targetUsername); // Debug log

        if (!targetUsername) {
            return { success: false, message: 'Username missing in session or form' };
        }

        // Verify permission: if target != self, must be admin
        // We compare against session.user.username (preferred) or name
        if (targetUsername !== sessionUsername && session.user.role !== 'ADMIN') {
            return { success: false, message: 'Unauthorized: Cannot create entry for another user' };
        }

        const rawData = {
            date: formData.get('date'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            description: formData.get('description') || undefined,
        };
        console.log("DEBUG: Parsing data", rawData);

        // Ping check removed (moved to top)

        const { date, startTime, endTime } = CreateEntrySchema.parse(rawData);

        const startDateTime = new Date(`${date}T${startTime}:00`);
        const endDateTime = new Date(`${date}T${endTime}:00`);
        const entryDate = new Date(`${date}T00:00:00`);

        if (endDateTime <= startDateTime) {
            return { success: false, message: "End time must be after start time" };
        }

        console.log("DEBUG: Connecting to DB to resolve user");

        // Resolve user by ID to avoid case sensitivity issues with 'connect: { username }'
        const dbUser = await prisma.user.findFirst({
            where: {
                username: { equals: targetUsername, mode: 'insensitive' }
            },
            select: { id: true }
        });

        if (!dbUser) {
            console.log("DEBUG: User not found", targetUsername);
            return { success: false, message: `Usuário '${targetUsername}' não encontrado.` };
        }

        console.log("DEBUG: User found, creating entry for ID:", dbUser.id);

        await prisma.overtimeEntry.create({
            data: {
                user: { connect: { id: dbUser.id } },
                date: entryDate,
                startTime: startDateTime,
                endTime: endDateTime,
                description: description || '',
            }
        });

        console.log("DEBUG: Saved to DB");

        try {
            revalidatePath('/');
            console.log("DEBUG: Revalidated path");
        } catch (revalidateError) {
            console.error("Revalidate Path Error:", revalidateError);
            // Don't fail the action if revalidation fails, just log it
        }

        return { success: true, message: 'Entry created successfully' };
    } catch (e: any) {
        console.error("Server Action Error (CATCH):", e); // Log the full error

        // Handle specific Prisma errors
        if (e.code === 'P2025') {
            return { success: false, message: `Usuário '${formData.get('targetUsername')}' não encontrado no banco de dados.` };
        }

        return { success: false, message: String(e.message || 'Internal Server Error') };
    }
}

export async function deleteEntry(entryId: string) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    // In a real app we should check if the user owns the entry or is admin
    await prisma.overtimeEntry.delete({
        where: { id: entryId }
    });

    revalidatePath('/');
}

export async function logout() {
    await signOut({ redirectTo: '/login' });
}
