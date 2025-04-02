import React, { useEffect, useState } from 'react';
import fightersData from '../fighters.json';
import ufcLogo from '../assets/ufc-logo.png';
import Confetti from 'react-confetti';
import { Sun, Moon } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] =useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [globalSuccessRate, setGlobalSuccessRate] =useState(null);

// FOR DEV TESTING ONLY - SET TO NULL OR A DATE STRING 'xx/xx/xxxx'
const devDateOverride = null;


  useEffect(() => {
    const storedStats = localStorage.getItem("ufcStats");
    if (storedStats) {
      setStats(JSON.parse(storedStats));
    }
  }, []);

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

    const today = devDateOverride || new Date().toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" });
    const seed = today.split("/").reverse().join("");
    const index = parseInt(seed) % normalized.length;
    setCorrectFighter(normalized[index]);

    const savedState = JSON.parse(localStorage.getItem("fotdGameState"));
if (savedState && savedState.date === today) {
  setGuesses(savedState.guesses);
  setGameOver(savedState.gameOver);
  setHasWon(savedState.hasWon);
  setShowPopup(savedState.gameOver); // show result popup again
}

const globalStats = JSON.parse(localStorage.getItem("fotdGlobalStats")) || {};
if (globalStats[today]) {
  const { plays, wins } = globalStats[today];
  setGlobalSuccessRate(plays > 0 ? Math.round((wins / plays) * 100) : null);
}

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

  useEffect(() => {
    if (gameOver) {
      const stats = JSON.parse(localStorage.getItem('ufcStats')) || {
        played: 0,
        wins: 0,
        currentStreak: 0,
        maxStreak: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 },
        lastPlayedDate: null
      };
      const today = devDateOverride || new Date().toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" });
      if (stats.lastPlayedDate !== today) {
        stats.played++;
        stats.lastPlayedDate = today;
        if (hasWon) {
          stats.wins++;
          stats.currentStreak++;
          stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
          const guessesUsed = guesses.length.toString();
          stats.distribution[guessesUsed]++;
        } else {
          stats.currentStreak = 0;
          stats.distribution.X++;
        }
        localStorage.setItem('ufcStats', JSON.stringify(stats));
        setStats(stats);
      }
    }
  }, [gameOver]);

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

    

    const today = new Date().toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" });
    localStorage.setItem("fotdGameState", JSON.stringify({
      date: today,
      guesses: [...newGuesses],
      gameOver: guess.Name === correctFighter.Name || newGuesses.length >= 6,
      hasWon: guess.Name === correctFighter.Name
    }));
    
    const globalStats = JSON.parse(localStorage.getItem("fotdGlobalStats")) || {};
if (!globalStats[today]) {
  globalStats[today] = { plays: 0, wins: 0 };
}
globalStats[today].plays++;
if (guess.Name === correctFighter.Name) {
  globalStats[today].wins++;
}
localStorage.setItem("fotdGlobalStats", JSON.stringify(globalStats));

const updated = globalStats[today];
setGlobalSuccessRate(updated.plays > 0 ? Math.round((updated.wins / updated.plays) * 100) : null);



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
        afghanistan: 'Asia', albania: 'Europe', angola: 'Africa', argentina: 'South America', armenia: 'Asia',
        australia: 'Oceania', austria: 'Europe', azerbaijan: 'Asia', bahrain: 'Asia', belguim: 'Europe',
        bolivia: 'South America', brazil: 'South America', cameroon: 'Africa', canada: 'North America',
        chile: 'South America', china: 'Asia', croatia: 'Europe', 'czech republic': 'Europe',
        'democratic republic of the congo': 'Africa', denmark: 'Europe', 'dominican republic': 'North America',
        ecuador: 'South America', egypt: 'Africa', england: 'Europe', france: 'Europe', georgia: 'Europe',
        germany: 'Europe', guam: 'Oceania', guyana: 'South America', iceland: 'Europe', india: 'Asia',
        indonesia: 'Asia', iraq: 'Asia', isreal: 'Asia', italy: 'Europe', jamaica: 'North America',
        japan: 'Asia', kazakhstan: 'Asia', kyrgyzstan: 'Asia', lithuania: 'Europe', mexico: 'North America',
        moldova: 'Europe', mongolia: 'Asia', morocco: 'Africa', myanmar: 'Asia', netherlands: 'Europe',
        'new zealand': 'Oceania', nigeria: 'Africa', norway: 'Europe', palestine: 'Asia', panama: 'North America',
        peru: 'South America', poland: 'Europe', portugal: 'Europe', 'republic of ireland': 'Europe',
        romania: 'Europe', russia: 'Europe', scotland: 'Europe', serbia: 'Europe', slovakia: 'Europe',
        'south africa': 'Africa', 'south korea': 'Asia', spain: 'Europe', switzerland: 'Europe',
        tajikistan: 'Asia', thailand: 'Asia', turkey: 'Asia', uganda: 'Africa', ukraine: 'Europe',
        uae: 'Asia', 'united states': 'North America', uzbekistan: 'Asia', venezuela: 'South America',
        vietnam: 'Asia', wales: 'Europe', zimbabwe: 'Africa'
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
      if (key === 'Age' || key === 'Height') {
        return diff <= 2 ? 'bg-yellow-500' : 'bg-gray-600';
      } else {
        return diff <= 5 ? 'bg-yellow-500' : 'bg-gray-600';
      }
    }
    if (key === 'Weight Class') {
      const weightOrder = [
        'Strawweight', 'Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight',
        'Welterweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight'
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
    const today = devDateOverride || new Date().toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" });
    const seed = today.split("/").reverse().join("");
    const index = parseInt(seed) % fighters.length;
    setCorrectFighter(fighters[index]);
    setGuesses([]);
    setInput('');
    setGameOver(false);
    setShowPopup(false);
    setHasWon(false);
    setShowConfetti(false);
  };

  const copyShareResult = () => {
    const emojiMap = {
      green: '🟩',
      yellow: '🟨',
      gray: '⬛'
    };
  
    const shareText = guesses.map((guess) => {
      return dataKeys.map((key) => {
        const color = getCellColor(key, guess[key]);
        if (color.includes('green')) return emojiMap.green;
        if (color.includes('yellow')) return emojiMap.yellow;
        return emojiMap.gray;
      }).join('');
    }).join('\n');
  
    const date = new Date().toLocaleDateString("en-US", {
      timeZone: "America/Los_Angeles",
      month: 'numeric',
      day: 'numeric',
    }).replace('/', '.');
  
    const header = `🥊 ${date} FOTD ${hasWon ? guesses.length : 'X'}/6`;
  
    if (navigator.share) {
        navigator.share({
          title: "UFC Fighter Guess",
          text: `${header}\n${shareText}`,
          url: window.location.href
        }).catch(err => console.error("Error sharing:", err));
      } else {
    navigator.clipboard.writeText(`${header}\n${shareText}`)
      .then(() => setCopied(true))
      .catch(() => console.error('Failed to copy'));
      }
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
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-md border dark:border-gray-700 bg-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center mb-4">
        <div className="relative w-full mr-2">
  <input
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={handleKeyPress}
    onFocus={() => setShowSuggestions(true)}
    onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
    placeholder="Enter fighter name"
    className="w-full border p-2 rounded text-black"
    disabled={gameOver}
  />
  {showSuggestions && input && (
    <div className="absolute left-0 right-0 top-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded mt-1 z-50 max-h-40 overflow-y-auto shadow-md">
      {fighters
        .filter((fighter) =>
          fighter.Name.toLowerCase().includes(input.toLowerCase())
        )
        .slice(0, 5)
        .map((fighter, index) => (
          <div
            key={index}
            onMouseDown={() => {
              setInput(fighter.Name);
              setShowSuggestions(false);
            }}
            className="px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          >
            {fighter.Name}
          </div>
        ))}
    </div>
  )}
</div>

          <button
            onClick={handleGuess}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={gameOver}
          >
            Guess
          </button>
        </div>

        <div className="overflow-x-auto w-full">
  <div className="min-w-[700px]">
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
  </div>
</div>


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
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md text-center relative w-80]">
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

{globalSuccessRate !== null && (
    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
      {globalSuccessRate}% of users guessed correctly today
    </p>
  )}

              <button
                onClick={() => window.location.href = '/unlimited'}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Try Unlimited Mode
              </button>
              <button
                onClick={copyShareResult}
                className="bg-gray-600 text-white px-4 py-2 rounded mt-2"
            >
                {copied ? 'Copied!' : 'Share Result'}
            </button>

            {stats && (
  <div className="popup-stats mt-4 text-left border-t border-gray-300 pt-2">
    <h3 className="text-lg font-semibold mb-2">📊 Statistics</h3>
    <p>Played: {stats.played}</p>
    <p>Win %: {Math.round((stats.wins / stats.played) * 100) || 0}</p>
    <p>Current Streak: {stats.currentStreak}</p>
    <p>Max Streak: {stats.maxStreak}</p>
    <h4 className="font-semibold mt-2">Guess Distribution</h4>
    {Object.entries(stats.distribution).map(([key, val]) => (
      <div key={key} className="flex items-center space-x-2 my-1">
        <span className="w-4">{key}</span>
        <div
          className="h-4 rounded bg-gray-400 text-xs text-white text-center"
          style={{
            width: `${val * 10}px`,
            backgroundColor:
              key === guesses.length.toString() || (!hasWon && key === 'X')
                ? 'green'
                : 'gray',
          }}
        >
          {val}
        </div>
      </div>
    ))}
  </div>
)}

            </div>

          </div>
        )}

      </div>

        <div className="flex justify-center mt-10">
            <button
                onClick={() => setShowHowToPlay(true)}
                className="text-sm bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-3 py-1 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                >
                    How to Play
                </button>
        </div>

        {showHowToPlay && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md text-left w-[90%] max-w-md relative">
      <button
        onClick={() => setShowHowToPlay(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
      >
        ✖
      </button>
      <h2 className="text-xl font-bold mb-2">How to Play</h2>
      <p className="mb-4">Guess the UFC fighter in 6 tries. Each guess will give you clues on how close you are in categories like country, weight class, age, height, and fight stats.</p>

      <div className="space-y-3">
        {/* Gray - Not Close */}
        <div className="flex items-center space-x-3">
          <div className="w-40 h-10 bg-gray-600 text-white rounded flex items-center justify-center font-medium">—</div>
          <span className="text-sm text-black dark:text-white">Not close</span>
        </div>

        {/* Yellow - Country */}
        <div className="flex items-center space-x-3">
          <div className="w-40 h-10 bg-yellow-500 text-white rounded flex items-center justify-center font-medium">Country</div>
          <span className="text-sm text-black dark:text-white">Correct Continent, Wrong Country</span>
        </div>

        {/* Yellow - Weight Class */}
        <div className="flex items-center space-x-3">
          <div className="w-40 h-10 bg-yellow-500 text-white rounded flex items-center justify-center font-medium">Weight Class</div>
          <span className="text-sm text-black dark:text-white">Within One Weight Class</span>
        </div>

        {/* Yellow - Age / Height */}
        <div className="flex items-center space-x-3">
          <div className="w-40 h-10 bg-yellow-500 text-white rounded flex items-center justify-center font-medium">Age / Height</div>
          <span className="text-sm text-black dark:text-white">Within ±2 of Age or Height</span>
        </div>

        {/* Yellow - Fights */}
        <div className="flex items-center space-x-3">
          <div className="w-40 h-10 bg-yellow-500 text-white rounded flex items-center justify-center font-medium">Number of Fights</div>
          <span className="text-sm text-black dark:text-white">Within ±5 of Number of Fights</span>
        </div>

        {/* Green - Correct */}
        <div className="flex items-center space-x-3">
          <div className="w-40 h-10 bg-green-600 text-white rounded flex items-center justify-center font-medium">✔</div>
          <span className="text-sm text-black dark:text-white">Exactly Correct for Category</span>
        </div>
      </div>
    </div>
  </div>
)}



    </div>
  );
}

export default App;
