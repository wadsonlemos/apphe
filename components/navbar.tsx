import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { auth, signOut } from '@/auth';

export default async function Navbar() {
    const session = await auth();

    return (
        <nav className="border-b bg-white">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="text-xl font-bold">
                    AppHE
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-sm font-medium hover:underline">
                        Dashboard
                    </Link>
                    <Link href="/entries" className="text-sm font-medium hover:underline">
                        Entries
                    </Link>
                    {session?.user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                                {session.user.name || session.user.email}
                            </span>
                            <form
                                action={async () => {
                                    'use server';
                                    await signOut();
                                }}
                            >
                                <Button variant="outline" size="sm">
                                    Sign Out
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button size="sm">Login</Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
