import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FighterOfTheDay from './components/FighterOfTheDay';
import UnlimitedMode from './components/UnlimitedMode';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
        <div className="max-w-6xl mx-auto py-6 px-4">
          
          <Routes>
            <Route path="/" element={<FighterOfTheDay />} />
            <Route path="/unlimited" element={<UnlimitedMode />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
