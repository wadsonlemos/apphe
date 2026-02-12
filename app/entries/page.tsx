import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { prisma } from '@/app/lib/db';
import { auth } from '@/auth';
import { format } from 'date-fns';

export default async function EntriesPage() {
    const session = await auth();

    // Fetch entries for the logged-in user
    const entries = await prisma.overtimeEntry.findMany({
        where: {
            user: { username: session?.user?.name! }
        },
        orderBy: { date: 'desc' }
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Overtime Entries</h1>
                    <Button asChild>
                        <Link href="/entries/new">Add New Entry</Link>
                    </Button>
                </div>

                <div className="grid gap-4">
                    {entries.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-muted-foreground">No entries found.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        entries.map((entry) => (
                            <Card key={entry.id}>
                                <CardContent className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="font-semibold">{format(entry.date, 'PPP')}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(entry.startTime, 'HH:mm')} - {format(entry.endTime, 'HH:mm')}
                                        </p>
                                        {entry.description && (
                                            <p className="text-sm mt-1">{entry.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        {/* Calculate duration */}
                                        <p className="font-bold">
                                            {((entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60 * 60)).toFixed(2)}h
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
