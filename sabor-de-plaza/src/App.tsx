import { useState } from 'react';
import { LandingHero } from './components/LandingHero';
import { Dashboard } from './components/Dashboard';
import { useCosechaData } from './hooks/useMockData';

type View = 'LANDING' | 'DASHBOARD';

function App() {
  const [view, setView] = useState<View>('LANDING');
  const products = useCosechaData();

  return (
    <>
      {view === 'LANDING' && (
        <LandingHero onStart={() => setView('DASHBOARD')} />
      )}
      {view === 'DASHBOARD' && (
        <Dashboard
          products={products}
          onBack={() => setView('LANDING')}
        />
      )}
    </>
  );
}

export default App;
