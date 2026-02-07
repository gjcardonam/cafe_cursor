interface LandingHeroProps {
  onStart: () => void;
}

export function LandingHero({ onStart }: LandingHeroProps) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4 transition-opacity duration-500">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          La Economía de la Plaza en tu Bolsillo
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-xl mx-auto">
          Monitoreamos la Mayorista, Minorista y Placita de Flórez para decirte qué comprar hoy en Medellín.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="px-8 py-4 rounded-xl bg-accent-500 hover:bg-orange-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Comenzar Ahorro
        </button>
      </div>
    </section>
  );
}
