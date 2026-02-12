import EntryForm from '@/components/EntryForm';
import Navbar from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewEntryPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto p-4">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Register Overtime</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EntryForm />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
