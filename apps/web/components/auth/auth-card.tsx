interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="auth-page">
      <div className="w-full max-w-[440px] relative z-10">
        <div className="rounded-3xl border p-10 backdrop-blur-2xl animate-fade-in-up"
          style={{
            background: "var(--color-bg-card)",
            borderColor: "var(--color-border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.15)",
          }}
        >
          <div className="text-center mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-5"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                boxShadow: "0 0 24px rgba(139, 92, 246, 0.3)",
              }}
            >
              🎓
            </div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
              {title}
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
