'use client';

import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { useState } from 'react';

export default function LoginForm() {
    const [errorMessage, dispatch, isPending] = useActionState(
        authenticate,
        undefined,
    );

    // Controlled inputs to match design style (though form action handles submission)
    const [username, setUsername] = useState('Geral');

    return (
        <form action={dispatch}>
            <div className="mb-[18px]">
                <label className="text-[#94a3b8] text-xs font-semibold block mb-1.5 uppercase tracking-wider">
                    Usuário
                </label>
                <select
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-3 rounded-[10px] bg-[rgba(30,41,59,0.8)] border border-[rgba(56,189,248,0.15)] text-[#e2e8f0] text-[15px] outline-none cursor-pointer appearance-none"
                >
                    <option value="geral">Geral</option>
                    <option value="3am">3AM</option>
                    <option value="wadson">Wadson (Func)</option>
                    <option value="romulo">Romulo (Func)</option>
                    <option value="jeferson">Jeferson (Func)</option>
                    <option value="raffael">Raffael (Func)</option>
                    <option value="ulisses">Ulisses (Func)</option>
                </select>
            </div>

            <div className="mb-6">
                <label className="text-[#94a3b8] text-xs font-semibold block mb-1.5 uppercase tracking-wider">
                    Senha
                </label>
                <input
                    name="password"
                    type="password"
                    required
                    className="w-full p-3 rounded-[10px] bg-[rgba(30,41,59,0.8)] border border-[rgba(56,189,248,0.15)] text-[#e2e8f0] text-[15px] outline-none box-border placeholder:text-slate-600"
                />
            </div>

            {errorMessage && (
                <div className="mb-[18px] p-2.5 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#fca5a5] text-[13px] text-center">
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full py-[13px] rounded-[10px] border-none bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] text-[#0c1222] text-[15px] font-bold cursor-pointer tracking-wide shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all hover:-translate-y-px hover:shadow-[0_0_30px_rgba(56,189,248,0.35)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isPending ? 'Entrando...' : 'Entrar'}
            </button>
        </form>
    );
}
