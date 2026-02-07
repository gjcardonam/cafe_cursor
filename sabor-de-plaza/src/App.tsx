import { useState } from 'react';
import { LandingHero } from './components/LandingHero';
import { Dashboard } from './components/Dashboard';
import { Footer } from './components/Footer';
import { useCosechaData } from './hooks/useMockData';

type View = 'LANDING' | 'DASHBOARD';

function App() {
  const [view, setView] = useState<View>('LANDING');
  const products = useCosechaData();

  return (
    <div className="flex flex-col min-h-screen">
      {view === 'LANDING' && (
        <LandingHero onStart={() => setView('DASHBOARD')} />
      )}
      {view === 'DASHBOARD' && (
        <Dashboard
          products={products}
          onBack={() => setView('LANDING')}
        />
      )}
      <Footer />
    </div>
  );
}

export default App;
