import { useState } from 'react';
import { Mail, Bell } from 'lucide-react';

export function NotificationSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 800);
  };

  return (
    <section className="mt-12 pt-10 border-t border-fresh-leaf/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 text-orange-600">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Recibe el resumen semanal
          </h2>
          <p className="text-sm text-gray-500">
            Cada viernes a las 5:00 p. m. te enviamos las mejores ofertas por correo.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col sm:flex-row gap-3 max-w-xl"
      >
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            disabled={status === 'loading'}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-fresh-leaf/30 focus:border-fresh-forest focus:ring-2 focus:ring-fresh-leaf/20 outline-none transition disabled:opacity-60 bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-3 rounded-xl bg-accent-500 hover:bg-orange-600 text-white font-medium transition disabled:opacity-60 shrink-0"
        >
          {status === 'loading' ? 'Enviando…' : status === 'success' ? '¡Listo!' : 'Suscribirme'}
        </button>
      </form>

      {status === 'success' && (
        <p className="mt-3 text-sm text-fresh-forest">
          Gracias. Te enviaremos el resumen cada viernes a las 5:00 p. m.
        </p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-sm text-red-600">
          No se pudo registrar. Intenta de nuevo.
        </p>
      )}
    </section>
  );
}
