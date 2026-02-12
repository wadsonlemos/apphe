import Navbar from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/auth';

export default async function Dashboard() {
  const session = await auth();

  // Mock data for display when DB is down
  const totalHours = 0;
  const bankBalance = 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto p-4">
        <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Overtime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHours}h</div>
              <p className="text-xs text-muted-foreground">
                Recorded this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Bank Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bankBalance}h</div>
              <p className="text-xs text-muted-foreground">
                Available to use
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{session?.user?.name || 'Guest'}</div>
              <p className="text-xs text-muted-foreground">
                {session?.user?.email}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
