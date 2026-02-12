'use client';

import { useState, useRef } from 'react';
import { createEntry, deleteEntry } from '@/app/lib/actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Entry = {
    id: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    description: string | null;
    userId: string;
    user: {
        name: string | null;
        username: string;
    }
};

type User = {
    id: string;
    name: string | null;
    username: string;
    role: string;
};

type Props = {
    session: any;
    initialEntries: Entry[];
    users: User[]; // For admin to see list of employees
};

export default function DashboardClient({ session, initialEntries, users }: Props) {
    const [selectedEmployeeUsername, setSelectedEmployeeUsername] = useState<string | null>(
        session.user.role === 'ADMIN' ? null : (session.user.username || session.user.name)
    );
    const [isPending, setIsPending] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // If regular user, they are always "selected"
    const isAdmin = session.user.role === 'ADMIN';

    // Group entries by username
    const entriesByUsername = initialEntries.reduce((acc, entry) => {
        const username = entry.user.username;
        if (!acc[username]) acc[username] = [];
        acc[username].push(entry);
        return acc;
    }, {} as Record<string, Entry[]>);

    const getTotalHours = (username: string) => {
        const userEntries = entriesByUsername[username] || [];
        let totalMilliseconds = 0;
        userEntries.forEach(e => {
            totalMilliseconds += (new Date(e.endTime).getTime() - new Date(e.startTime).getTime());
        });
        const totalMinutes = Math.floor(totalMilliseconds / (1000 * 60));
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return totalMilliseconds === 0 ? "0h" : `${h}h${m > 0 ? ` ${m}min` : ""}`;
    };

    const handleLogout = () => {
        // In NextAuth we use a link or button to signout flow, usually just valid link
        window.location.href = '/api/auth/signout';
    };

    async function handleAddEntry(formData: FormData) {
        setIsPending(true);
        // Inject the target username
        if (selectedEmployeeUsername) {
            formData.append('targetUsername', selectedEmployeeUsername);
        }

        try {
            await createEntry(formData);
            formRef.current?.reset();
            // Optional: Show success toast
        } catch (e: any) {
            console.error(e);
            alert(`Erro ao adicionar lançamento: ${e.message}`);
        } finally {
            setIsPending(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir?")) return;
        try {
            await deleteEntry(id);
        } catch (e: any) {
            console.error(e);
            alert(`Erro ao excluir: ${e.message}`);
        }
    }

    const downloadCSV = () => {
        if (!selectedEmployeeUsername) return;
        const entries = entriesByUsername[selectedEmployeeUsername] || [];
        if (entries.length === 0) return alert("Nenhum lançamento para exportar.");

        const headers = ["Data", "Inicio", "Fim", "Total", "Descricao"];
        const rows = entries.map(entry => {
            const start = new Date(entry.startTime);
            const end = new Date(entry.endTime);
            const totalMs = end.getTime() - start.getTime();
            const h = Math.floor((totalMs / (1000 * 60)) / 60);
            const m = Math.floor((totalMs / (1000 * 60)) % 60);
            const duration = `${h}h${m > 0 ? ` ${m}min` : ''}`;

            return [
                format(new Date(entry.date), 'dd/MM/yyyy'),
                format(start, 'HH:mm'),
                format(end, 'HH:mm'),
                duration,
                `"${(entry.description || '').replace(/"/g, '""')}"` // Escape quotes
            ].join(",");
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `extrato_horas_${selectedEmployeeUsername}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- UI RENDER ---

    return (
        <div className="min-h-screen text-[#e2e8f0] pb-10">
            {/* Header */}
            <header className="bg-[rgba(15,23,42,0.7)] backdrop-blur-[20px] border-b border-[rgba(56,189,248,0.1)] px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] flex items-center justify-center text-lg shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                        ⏱
                    </div>
                    <div>
                        <div className="font-bold text-base text-[#f1f5f9]">Controle de Horas</div>
                        <div className="text-[11px] text-[#64748b] uppercase tracking-wider">
                            {format(new Date(), "PPPP", { locale: ptBR })}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3.5">
                    <span className={`px-3 py-1.5 rounded-[20px] text-xs font-semibold border ${isAdmin ? "bg-[rgba(168,85,247,0.15)] border-[rgba(168,85,247,0.3)] text-[#c4b5fd]" : "bg-[rgba(56,189,248,0.1)] border-[rgba(56,189,248,0.2)] text-[#7dd3fc]"}`}>
                        {isAdmin ? "👑 Admin" : `👤 ${session.user.name}`}
                    </span>
                    <button onClick={handleLogout} className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#fca5a5] px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-[rgba(239,68,68,0.2)] transition-colors">
                        Sair
                    </button>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-5 py-6 relative z-[1]">

                {/* ADMIN GRID VIEW */}
                {isAdmin && !selectedEmployeeUsername && (
                    <>
                        <h2 className="text-lg font-bold mb-5 text-[#94a3b8]">
                            📊 Painel Administrativo
                        </h2>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
                            {users.filter(u => u.role !== 'ADMIN').map((emp, i) => { // Show only employees? Or everyone? Following request implies specific employees.
                                const count = (entriesByUsername[emp.username] || []).length;
                                // Simple color rotation
                                const colors = [
                                    "from-[rgba(14,165,233,0.1)] to-[rgba(14,165,233,0.05)] border-[rgba(14,165,233,0.2)] text-[#0ea5e9]",
                                    "from-[rgba(139,92,246,0.1)] to-[rgba(139,92,246,0.05)] border-[rgba(139,92,246,0.2)] text-[#8b5cf6]",
                                    "from-[rgba(16,185,129,0.1)] to-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-[#10b981]",
                                    "from-[rgba(245,158,11,0.1)] to-[rgba(245,158,11,0.05)] border-[rgba(245,158,11,0.2)] text-[#f59e0b]",
                                    "from-[rgba(239,68,68,0.1)] to-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.2)] text-[#ef4444]",
                                ];
                                const style = colors[i % colors.length];

                                return (
                                    <button
                                        key={emp.username}
                                        onClick={() => setSelectedEmployeeUsername(emp.username)}
                                        className={`bg-gradient-to-br ${style.split(" ")[0]} ${style.split(" ")[1]} border ${style.split(" ")[2]} rounded-[14px] p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg`}
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold bg-white/5 ${style.split(" ")[3]}`}>
                                                {emp.name ? emp.name[0] : emp.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-base font-bold text-[#f1f5f9]">{emp.name || emp.username}</div>
                                                <div className="text-xs text-[#64748b] mt-0.5">
                                                    {count === 0 ? "Nenhum lançamento" : `${count} lançamento(s) · ${getTotalHours(emp.username)}`}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </>
                )}

                {/* DETAIL VIEW (Admin selecting user OR Regular User) */}
                {selectedEmployeeUsername && (
                    <>
                        {isAdmin && (
                            <button
                                onClick={() => setSelectedEmployeeUsername(null)}
                                className="bg-[rgba(30,41,59,0.5)] border border-[rgba(56,189,248,0.15)] text-[#94a3b8] px-4 py-2 rounded-lg text-[13px] font-semibold mb-5 flex items-center gap-1.5 hover:bg-[rgba(30,41,59,0.8)] transition-colors"
                            >
                                ← Voltar
                            </button>
                        )}

                        <div className="flex items-center justify-between mb-7">
                            <div className="flex items-center gap-3.5">
                                <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-[rgba(14,165,233,0.15)] to-[rgba(56,189,248,0.3)] border border-[rgba(56,189,248,0.2)] flex items-center justify-center text-[22px] font-bold text-[#38bdf8]">
                                    {selectedEmployeeUsername[0].toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="m-0 text-[22px] font-bold text-white capitalize">{selectedEmployeeUsername}</h2>
                                    <p className="m-[2px_0_0] text-[#64748b] text-[13px]">
                                        Total acumulado: <span className="text-[#38bdf8] font-semibold">{getTotalHours(selectedEmployeeUsername)}</span>
                                    </p>
                                </div>
                            </div>
                            {/* Export CSV Button */}
                            <button
                                onClick={downloadCSV}
                                className="bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-[#34d399] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[rgba(16,185,129,0.2)] transition-colors flex items-center gap-2"
                            >
                                📄 Exportar CSV
                            </button>
                        </div>

                        {/* FORM */}
                        <div className="bg-[rgba(15,23,42,0.6)] border border-[rgba(56,189,248,0.1)] rounded-[14px] p-6 mb-6">
                            <h3 className="m-0 mb-[18px] text-[15px] font-bold text-[#94a3b8]">
                                ➕ Novo Lançamento de Hora Extra
                            </h3>
                            <form ref={formRef} action={handleAddEntry}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3.5">
                                    <div>
                                        <label className="text-[#64748b] text-[11px] font-semibold block mb-1.5 uppercase tracking-wider">Data</label>
                                        <input
                                            name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]}
                                            className="w-full p-2.5 rounded-lg bg-[rgba(30,41,59,0.8)] border border-[rgba(56,189,248,0.15)] text-[#e2e8f0] text-sm outline-none focus:border-[#0ea5e9]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[#64748b] text-[11px] font-semibold block mb-1.5 uppercase tracking-wider">Início</label>
                                        <input
                                            name="startTime" type="time" required
                                            className="w-full p-2.5 rounded-lg bg-[rgba(30,41,59,0.8)] border border-[rgba(56,189,248,0.15)] text-[#e2e8f0] text-sm outline-none focus:border-[#0ea5e9]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[#64748b] text-[11px] font-semibold block mb-1.5 uppercase tracking-wider">Fim</label>
                                        <input
                                            name="endTime" type="time" required
                                            className="w-full p-2.5 rounded-lg bg-[rgba(30,41,59,0.8)] border border-[rgba(56,189,248,0.15)] text-[#e2e8f0] text-sm outline-none focus:border-[#0ea5e9]"
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="text-[#64748b] text-[11px] font-semibold block mb-1.5 uppercase tracking-wider">Descrição (opcional)</label>
                                    <input
                                        name="description" type="text" placeholder="Ex: Manutenção, Plantão..."
                                        className="w-full p-2.5 rounded-lg bg-[rgba(30,41,59,0.8)] border border-[rgba(56,189,248,0.15)] text-[#e2e8f0] text-sm outline-none focus:border-[#0ea5e9]"
                                    />
                                </div>
                                <button
                                    type="submit" disabled={isPending}
                                    className="bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] text-[#0c1222] border-none px-7 py-2.5 rounded-lg text-sm font-bold cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:shadow-[0_0_30px_rgba(56,189,248,0.3)] transition-shadow disabled:opacity-70"
                                >
                                    {isPending ? 'Processando...' : 'Registrar Hora Extra'}
                                </button>
                            </form>
                        </div>

                        {/* LIST */}
                        <div className="flex items-center justify-between mb-3.5">
                            <h3 className="text-[15px] font-bold text-[#94a3b8]">
                                📝 Lançamentos Registrados
                            </h3>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            {(entriesByUsername[selectedEmployeeUsername] || []).length === 0 ? (
                                <div className="bg-[rgba(15,23,42,0.4)] border border-dashed border-[rgba(56,189,248,0.15)] rounded-xl p-10 text-center text-[#475569]">
                                    Nenhum lançamento registrado ainda.
                                </div>
                            ) : (
                                (entriesByUsername[selectedEmployeeUsername] || [])
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map(entry => {
                                        const start = new Date(entry.startTime);
                                        const end = new Date(entry.endTime);
                                        const totalMs = end.getTime() - start.getTime();
                                        const h = Math.floor((totalMs / (1000 * 60)) / 60);
                                        const m = Math.floor((totalMs / (1000 * 60)) % 60);

                                        return (
                                            <div key={entry.id} className="bg-[rgba(15,23,42,0.6)] border border-[rgba(56,189,248,0.08)] rounded-[10px] p-[14px_18px] flex items-center justify-between hover:bg-[rgba(15,23,42,0.8)] transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-[rgba(56,189,248,0.08)] rounded-lg p-[8px_12px] text-center min-w-[70px]">
                                                        <div className="text-xs text-[#64748b]">{format(new Date(entry.date), 'dd/MM')}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-[#e2e8f0]">
                                                            {format(start, 'HH:mm')} → {format(end, 'HH:mm')}
                                                            <span className="ml-2.5 text-[#38bdf8] text-[13px]">{h}h{m > 0 ? ` ${m}min` : ''}</span>
                                                        </div>
                                                        {entry.description && (
                                                            <div className="text-xs text-[#64748b] mt-0.5">{entry.description}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(entry.id)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#fca5a5] hover:bg-[rgba(239,68,68,0.2)] hover:text-red-400 transition-colors"
                                                    title="Excluir"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )
                                    })
                            )}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
