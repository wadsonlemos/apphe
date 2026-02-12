import LoginForm from '@/components/login-form';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px)",
                    backgroundSize: "24px 24px"
                }}
            />

            <div className="glass-card w-full max-w-sm rounded-[16px] p-10 relative z-10">
                <div className="text-center mb-9">
                    <div className="w-16 h-16 rounded-[16px] mx-auto mb-4 flex items-center justify-center text-[28px] shadow-[0_0_30px_rgba(56,189,248,0.3)] bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8]">
                        ⏱
                    </div>
                    <h1 className="text-[#f1f5f9] text-[22px] font-bold -tracking-[0.02em] m-0">
                        Controle de Horas
                    </h1>
                    <p className="text-[#64748b] text-[13px] mt-1.5 uppercase tracking-widest">
                        Sistema de Lançamento
                    </p>
                </div>

                <LoginForm />
            </div>
        </div>
    );
}
