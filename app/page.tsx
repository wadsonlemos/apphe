import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import DashboardClient from '@/components/DashboardClient';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch data based on role
  let users = [];
  let entries = [];

  if (session.user.role === 'ADMIN') {
    // Admin sees all users and all entries
    users = await prisma.user.findMany({
      where: {
        AND: [
          { name: { not: { contains: '(Func)' } } },
          { name: { notIn: ['Wadson', 'Romulo', 'Jeferson', 'Raffael', 'Ulisses', 'Wadson (Func)', 'Romulo (Func)', 'Jeferson (Func)', 'Raffael (Func)', 'Ulisses (Func)'] } },
          { username: { notIn: ['wadson', 'romulo', 'jeferson', 'raffael', 'ulisses'] } }
        ]
      },
      select: { id: true, name: true, username: true, role: true }
    });
    entries = await prisma.overtimeEntry.findMany({
      include: { user: { select: { name: true, username: true } } },
      orderBy: { date: 'desc' }
    });
  } else {
    // Regular user sees only themselves and their own entries
    // We pass them as a single "user" in the list so the UI can "select" them automatically
    users = [
      {
        id: session.user.id!,
        name: session.user.name || null,
        username: session.user.username || session.user.name!,
        role: session.user.role!
      }
    ];

    entries = await prisma.overtimeEntry.findMany({
      where: { user: { username: session.user.username || session.user.name! } },
      include: { user: { select: { name: true, username: true } } },
      orderBy: { date: 'desc' }
    });
  }

  return (
    <DashboardClient
      session={session}
      users={users}
      initialEntries={entries as any}
    />
  );
}
