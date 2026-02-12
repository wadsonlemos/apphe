import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function EntriesPage() {
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

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Entries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">No entries found (Database unavailable).</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
