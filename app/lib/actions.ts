'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/app/lib/db';
import { auth } from '@/auth';
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

export async function createEntry(formData: FormData) {
    const session = await auth();
    if (!session?.user) {
        throw new Error('User not authenticated');
    }

    // Admins can specify a username (targetUser), regular users use their own
    const targetUsername = formData.get('targetUsername') as string || session.user.name!;

    // Verify permission: if target != self, must be admin
    if (targetUsername !== session.user.name && session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const { date, startTime, endTime, description } = CreateEntrySchema.parse({
        date: formData.get('date'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        description: formData.get('description'),
    });

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);
    const entryDate = new Date(`${date}T00:00:00`);

    if (endDateTime <= startDateTime) {
        console.error("End time must be after start time");
        return;
    }

    await prisma.overtimeEntry.create({
        data: {
            user: { connect: { username: targetUsername } },
            date: entryDate,
            startTime: startDateTime,
            endTime: endDateTime,
            description: description || '',
        }
    });

    revalidatePath('/');
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
