import { IMAGES } from '../constants/images';

interface LandingHeroProps {
  onStart: () => void;
}

export function LandingHero({ onStart }: LandingHeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 transition-opacity duration-500 overflow-hidden">
      {/* Imagen de fondo: mercado fresco */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${IMAGES.hero})` }}
      />
      {/* Overlay verde suave para legibilidad y sensación fresca */}
      <div
        className="absolute inset-0 bg-hero-pattern"
        aria-hidden
      />
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-lg mb-6 leading-tight animate-slide-down">
          La Economía de la Plaza en tu Bolsillo
        </h1>
        <p className="text-lg sm:text-xl text-white/95 drop-shadow-md mb-10 max-w-xl mx-auto animate-fade-in-up-delay">
          Monitoreamos la Mayorista, Minorista y Placita de Flórez para decirte qué comprar hoy en Medellín.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="px-8 py-4 rounded-xl bg-white text-emerald-700 font-semibold text-lg shadow-xl hover:shadow-2xl hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105 animate-fade-in-up-delay-lg border-2 border-white/80"
        >
          Comenzar Ahorro
        </button>
      </div>
    </section>
  );
}
