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
    if (!session?.user?.email) {
        throw new Error('User not authenticated');
    }

    const { date, startTime, endTime, description } = CreateEntrySchema.parse({
        date: formData.get('date'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        description: formData.get('description'),
    });

    // Combine date and time to create DateTime objects
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);
    const entryDate = new Date(`${date}T00:00:00`);

    // Basic validation
    if (endDateTime <= startDateTime) {
        // In a real app we'd return a form error, for now we'll just throw or handle it.
        // Let's rely on client-side mostly but this is a safety check.
        console.error("End time must be after start time");
        return;
    }

    await prisma.overtimeEntry.create({
        data: {
            user: { connect: { username: session.user.name! } },
            date: entryDate,
            startTime: startDateTime,
            endTime: endDateTime,
            description: description || '',
        }
    });

    revalidatePath('/entries');
    revalidatePath('/');
}
