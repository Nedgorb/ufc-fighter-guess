import React, { useEffect, useState } from 'react';
import fightersData from '../fighters.json';
import ufcLogo from '../assets/ufc-logo.png';
import Confetti from 'react-confetti';

function App() {
  const [fighters, setFighters] = useState([]);
  const [input, setInput] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [correctFighter, setCorrectFighter] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const normalizeFighter = (fighter) => ({
    Name: fighter.Name,
    Country: fighter.Country,
    "Weight Class": fighter["Weight Class"],
    Age: fighter.Age,
    Height: fighter.Height,
    "UFC Fights": fighter["UFC Fights"],
    "MMA Fights": fighter["MMA Fights"],
  });

  useEffect(() => {
    const normalized = fightersData.map(normalizeFighter);
    setFighters(normalized);
    setCorrectFighter(
      normalized[Math.floor(Math.random() * normalized.length)]
    );

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleGuess = () => {
    if (gameOver || !input.trim()) return;
    const guess = fighters.find(
      (fighter) =>
        fighter.Name &&
        fighter.Name.toLowerCase() === input.toLowerCase()
    );

    if (!guess) return;

    const newGuesses = [...guesses, guess];
    setGuesses(newGuesses);
    setInput('');

    if (guess.Name === correctFighter.Name) {
      setGameOver(true);
      setShowPopup(true);
      setHasWon(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 6000);
    } else if (newGuesses.length >= 6) {
      setGameOver(true);
      setShowPopup(true);
      setHasWon(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGuess();
    }
  };

  const getCellColor = (key, value) => {
    if (!correctFighter) return 'bg-gray-600';
    const correctValue = correctFighter?.[key];
    if (!value || !correctValue || value === "Unknown" || correctValue === "Unknown") {
      return 'bg-gray-600';
    }
    if (value === correctValue) return 'bg-green-600';
    if (key === 'Country') {
      const continents = {
        afghanistan: 'Asia',
  albania: 'Europe',
  angola: 'Africa',
  argentina: 'South America',
  armenia: 'Asia',
  australia: 'Oceania',
  austria: 'Europe',
  azerbaijan: 'Asia',
  bahrain: 'Asia',
  belguim: 'Europe',
  bolivia: 'South America',
  brazil: 'South America',
  cameroon: 'Africa',
  canada: 'North America',
  chile: 'South America',
  china: 'Asia',
  croatia: 'Europe',
  'czech republic': 'Europe',
  'democratic republic of the congo': 'Africa',
  denmark: 'Europe',
  'dominican republic': 'North America',
  ecuador: 'South America',
  egypt: 'Africa',
  england: 'Europe',
  france: 'Europe',
  georgia: 'Europe',
  germany: 'Europe',
  guam: 'Oceania',
  guyana: 'South America',
  iceland: 'Europe',
  india: 'Asia',
  indonesia: 'Asia',
  iraq: 'Asia',
  isreal: 'Asia',
  italy: 'Europe',
  jamaica: 'North America',
  japan: 'Asia',
  kazakhstan: 'Asia',
  kyrgyzstan: 'Asia',
  lithuania: 'Europe',
  mexico: 'North America',
  moldova: 'Europe',
  mongolia: 'Asia',
  morocco: 'Africa',
  myanmar: 'Asia',
  netherlands: 'Europe',
  'new zealand': 'Oceania',
  nigeria: 'Africa',
  norway: 'Europe',
  palestine: 'Asia',
  panama: 'North America',
  peru: 'South America',
  poland: 'Europe',
  portugal: 'Europe',
  'republic of ireland': 'Europe',
  romania: 'Europe',
  russia: 'Europe',
  scotland: 'Europe',
  serbia: 'Europe',
  slovakia: 'Europe',
  'south africa': 'Africa',
  'south korea': 'Asia',
  spain: 'Europe',
  switzerland: 'Europe',
  tajikistan: 'Asia',
  thailand: 'Asia',
  turkey: 'Asia',
  uganda: 'Africa',
  ukraine: 'Europe',
  uae: 'Asia',
  'united states': 'North America',
  uzbekistan: 'Asia',
  venezuela: 'South America',
  vietnam: 'Asia',
  wales: 'Europe',
  zimbabwe: 'Africa'

      };
      if (
        continents[value.toLowerCase()] &&
        continents[value.toLowerCase()] === continents[correctValue.toLowerCase()]
      ) {
        return 'bg-yellow-500';
      }
      
    }
      if (['Age', 'Height', 'UFC Fights', 'MMA Fights'].includes(key)) {
        const diff = Math.abs(Number(value) - Number(correctValue));
        if (key === 'Age', 'Height') {
          return diff <= 2 ? 'bg-yellow-500' : 'bg-gray-600';
        } else {
          return diff <= 5 ? 'bg-yellow-500' : 'bg-gray-600';
        }
      }

      
      
      if (key === 'Weight Class') {
        const weightOrder = [
          'Strawweight',
          'Flyweight',
          'Bantamweight',
          'Featherweight',
          'Lightweight',
          'Welterweight',
          'Middleweight',
          'Light Heavyweight',
          'Heavyweight'
        ];
      
        const guessedIndex = weightOrder.indexOf(value);
        const correctIndex = weightOrder.indexOf(correctValue);
      
        if (guessedIndex === -1 || correctIndex === -1) {
          return 'bg-gray-600';
        }
      
        const diff = Math.abs(guessedIndex - correctIndex);
        return diff === 1 ? 'bg-yellow-500' : 'bg-gray-600';
      }
      

    return 'bg-gray-600';
  };

  const resetGame = () => {
    const newFighter = fighters[Math.floor(Math.random() * fighters.length)];
    setCorrectFighter(newFighter);
    setGuesses([]);
    setInput('');
    setGameOver(false);
    setShowPopup(false);
    setHasWon(false);
    setShowConfetti(false);
  };

  const guessRows = [...guesses];
  while (guessRows.length < 6) {
    guessRows.push(null);
  }

  const dataKeys = ['Name', 'Country', 'Weight Class', 'Age', 'Height', 'UFC Fights', 'MMA Fights'];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
          <div className="max-w-6xl mx-auto py-6 px-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <img src={ufcLogo} alt="UFC Logo" className="h-8" />
                <h1 className="text-2xl font-bold">Fighter Guess</h1>
              </div>
              <div className="flex space-x-2">
                <a href="/" className="text-sm bg-gray-300 dark:bg-gray-700 px-2 py-1 rounded">Fighter of the Day</a>
                <a href="/unlimited" className="text-sm bg-gray-300 dark:bg-gray-700 px-2 py-1 rounded">Unlimited Mode</a>
                <button
                  className="text-sm bg-gray-300 dark:bg-gray-700 px-2 py-1 rounded"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode ? 'Toggle Light Mode' : 'Toggle Dark Mode'}
                </button>
              </div>
            </div>
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            list="fighter-names"
            placeholder="Enter fighter name"
            className="border p-2 rounded mr-2 text-black"
            disabled={gameOver}
          />
          <datalist id="fighter-names">
            {fighters
              .filter(
                (fighter) =>
                  fighter.Name &&
                  fighter.Name.toLowerCase().includes(input.toLowerCase())
              )
              .slice(0, 5)
              .map((fighter, index) => (
                <option key={index} value={fighter.Name} />
              ))}
          </datalist>
          <button
            onClick={handleGuess}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={gameOver}
          >
            Guess
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dataKeys.map((header) => (
            <div key={header} className="font-semibold text-center">
              {header}
            </div>
          ))}
        </div>
        {guessRows.map((guess, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7 gap-2 mb-2">
            {guess ? (
              dataKeys.map((key, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-center text-white font-medium ${getCellColor(
                    key,
                    guess[key]
                  )}`}
                >
                  {guess[key]}
                </div>
              ))
            ) : (
              Array(7)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className="p-2 rounded text-center bg-gray-800 text-gray-400"
                  >
                    —
                  </div>
                ))
            )}
          </div>
        ))}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            {showConfetti && (
              <Confetti
                width={windowSize.width}
                height={windowSize.height}
                numberOfPieces={300}
                recycle={false}
              />
            )}
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md text-center relative w-80 animate-[bounce_0.5s_ease-in-out_2]">
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                ✖
              </button>
              {hasWon ? (
                <>
                  <h2 className="text-xl font-bold mb-2">🎉 You guessed the right fighter!</h2>
                  <p className="mb-4">It was <strong>{correctFighter.Name}</strong>!</p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-2">❌ Out of guesses!</h2>
                  <p className="mb-4">The correct fighter was <strong>{correctFighter.Name}</strong>.</p>
                </>
              )}
              <button
                onClick={resetGame}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Try Another Fighter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
