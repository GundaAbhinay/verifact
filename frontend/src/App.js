import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Verifier from './components/Verifier';

function App() {
  const [started, setStarted] = useState(false);

  return (
    <div className="App">
      {started ? <Verifier /> : <LandingPage onStart={() => setStarted(true)} />}
    </div>
  );
}

export default App;
