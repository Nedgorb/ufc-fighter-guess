import React, { useEffect, useState } from 'react';
import fightersData from '../fighters.json';
import ufcLogo from '../assets/ufc-logo.png';
import Confetti from 'react-confetti';
import UnlimitedLogin from '../UnlimitedLogin';
import { supabase } from '../supabaseClient'; // Make sure this is already in place
import UnlimitedLeaderboard from '../UnlimitedLeaderboard'; // adjust path if needed
import { Moon, Sun, Smartphone, Monitor } from 'lucide-react';

const updateUserStats = async (user, guessesTaken) => {
  const newPlayed = user.games_played + 1;
  const newWon = user.games_won + 1;
  const newAvg = ((user.avg_score * user.games_played) + guessesTaken) / newPlayed;

  const { data, error } = await supabase
    .from('unlimited_scores')
    .update({
      games_played: newPlayed,
      games_won: newWon,
      avg_score: newAvg,
    })
    .eq('username', user.username)
    .select()
    .single();

  if (error) {
    console.error('Failed to update stats:', error);
  } else {
    console.log('Stats updated:', data);
  }
};




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
  const [showHowToPlay, setShowHowToPlay] =useState(false);
  const [showSuggestions, setShowSuggestions] =useState(false);
  const [user, setUser] = useState(null);
  const [isMobileView, setIsMobileView] =useState(window.innerWidth <= 768);


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

setIsMobileView(window.innerWidth <= 768);

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
      
        // Update stats in Supabase
        updateUserStats(user, newGuesses.length);
      }
       else if (newGuesses.length >= 6) {
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


  if (!user) {
    return <UnlimitedLogin onLogin={setUser} />;
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
  
          <div className="max-w-6xl mx-auto py-6 px-4">
{/* Header */}
{isMobileView ? (
  // MOBILE HEADER
  <div className="mb-4">
    <div className="flex flex-col items-center space-y-2 mb-4 text-center">
      <img src={ufcLogo} alt="UFC Logo" className="h-8" />
      <h1 className="text-2xl font-bold">
        Fighter Guess{window.location.pathname.includes("unlimited") ? " - Unlimited" : ""}
      </h1>
    </div>
    <div className="flex flex-wrap justify-center gap-2">
      <a href="/" className="text-sm bg-gray-300 dark:bg-gray-700 px-2 py-1 rounded">FOTD</a>
      <a href="/unlimited" className="text-sm bg-gray-300 dark:bg-gray-700 px-2 py-1 rounded">Unlimited</a>
      <button
        onClick={() => setIsMobileView(!isMobileView)}
        className="p-2 rounded-md border dark:border-gray-700 bg-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
        aria-label="Toggle mobile/desktop view"
      >
        <Monitor size={20} />
      </button>
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="p-2 rounded-md border dark:border-gray-700 bg-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  </div>
) : (
  // DESKTOP HEADER
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center space-x-2">
      <img src={ufcLogo} alt="UFC Logo" className="h-8" />
      <h1 className="text-2xl font-bold">Fighter Guess</h1>
    </div>
    <div className="flex space-x-2">
      <a href="/" className="text-sm bg-gray-300 dark:bg-gray-700 px-2 py-1 rounded">Fighter of the Day</a>
      <a href="/unlimited" className="text-sm bg-gray-300 dark:bg-gray-700 px-2 py-1 rounded">Unlimited Mode</a>
      <button
        onClick={() => setIsMobileView(!isMobileView)}
        className="p-2 rounded-md border dark:border-gray-700 bg-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
        aria-label="Toggle mobile/desktop view"
      >
        <Smartphone size={20} />
      </button>
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="p-2 rounded-md border dark:border-gray-700 bg-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  </div>
)}


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
        {isMobileView ? (
  // MOBILE LAYOUT
  <div className="w-full overflow-x-auto">
    <div className="flex">
    <div className="flex flex-col flex-shrink-0 mr-2 space-y-2">
  {dataKeys.map((key) => (
    <div
      key={key}
      className="w-28 h-12 flex items-center justify-center rounded bg-transparent text-black dark:text-white font-medium text-center"
    >
      {key}
    </div>
  ))}
</div>




      <div className="flex overflow-x-auto space-x-2">
        {guessRows.map((guess, guessIndex) => (
          <div key={guessIndex} className="flex flex-col space-y-2">
            {dataKeys.map((key, i) => (
              <div
                key={i}
                className={`w-28 h-12 flex items-center justify-center rounded text-white font-medium text-center ${guess ? getCellColor(key, guess[key]) : 'bg-gray-800 text-gray-400'}`}
              >
                {guess ? guess[key] : '—'}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
) : (
  // DESKTOP LAYOUT
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
)}


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

              <UnlimitedLeaderboard />

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
    <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-md text-left w-[90%] max-w-lg relative">
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
