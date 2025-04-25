// Reach imports
import React, { useEffect, useState } from 'react';

// Fighter data and assets
import fightersData from '../fighters.json';
import ufcLogo from '../assets/ufc-logo.png';

// Visual effects and icons
import Confetti from 'react-confetti';
import { Sun, Moon, Smartphone, Monitor, UserCircle } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { SignInButton } from '@clerk/clerk-react';
import { useRef } from 'react';

function App() {
    // ===STATE VARIABLES===

  // Full list of fighters  
  const [fighters, setFighters] = useState([]);

  //Current input from user (guess box)
  const [input, setInput] = useState('');

  //List of all user guesses for today
  const [guesses, setGuesses] = useState([]);

  //Fighter of the Day (target answer)
  const [correctFighter, setCorrectFighter] = useState(null);

  //Game state flags
  const [gameOver, setGameOver] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  //Dark mode state (persisted in localStorage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("isDarkMode");
    return saved ? JSON.parse(saved) : false;
  });  
  
  //Confetti trigger for win screen
  const [showConfetti, setShowConfetti] = useState(false);

  //Tracks window size for rendering confetti correctly
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  //Allows user to navigate with arrow keys
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  //Easy mode 
  const [isEasyMode, setIsEasyMode] = useState(() => {
    const saved = localStorage.getItem("isEasyMode");
    return saved ? JSON.parse(saved) : false; // false = hard mode default
  });  

  //UI flags
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] =useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [globalSuccessRate, setGlobalSuccessRate] =useState(null);
  const [isMobileView, setIsMobileView] =useState(window.innerWidth <= 768);
  const { user } = useUser();
  const { signOut } = useClerk();
  const [showUserMenu, setShowUserMenu] = useState(false);  
  const popupRef = useRef(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const statsModalRef = useRef(null);
  const [statsTab, setStatsTab] = useState("fotd");
  const [fotdStats, setFotdStats] = useState(null);




// FOR DEV TESTING ONLY - SET TO NULL OR A DATE STRING 'xx/xx/xxxx'
const devDateOverride = null;

useEffect(() => {
    const storedStats = localStorage.getItem("ufcStats");
    if (storedStats) {
      setFotdStats(JSON.parse(storedStats));
    }
  }, []);
  
  const [guestMode, setGuestMode] = useState(() => {
    return localStorage.getItem("guestMode") === "true";
  });
  

// === EFFECT: Load local user stats from localStorage ===
  useEffect(() => {
    const storedStats = localStorage.getItem("ufcStats");
    if (storedStats) {
      setStats(JSON.parse(storedStats));
    }
  }, []);

  //Easy mode effect
  useEffect(() => {
    localStorage.setItem("isEasyMode", JSON.stringify(isEasyMode));
  }, [isEasyMode]);  

  //Allows to click outside box to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-dropdown')) {
        setShowUserMenu(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  

  //Normalize fighter object keys (standardize capitalism and structure)
  const normalizeFighter = (fighter) => ({
    Name: fighter.Name,
    Country: fighter.Country,
    "Weight Class": fighter["Weight Class"],
    Age: fighter.Age,
    Height: fighter.Height,
    "UFC Fights": fighter["UFC Fights"],
    "MMA Fights": fighter["MMA Fights"],
  });

  // === EFFECT: Initialize today's game state, target fighter, and layout ===
  useEffect(() => {
    //Prepare fighter list with consistent key formatting
    const normalized = fightersData.map(normalizeFighter);
    setFighters(normalized);

    //Pick today's fighter deterministically based on date
    const today = devDateOverride || new Date().toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" });
    const seed = today.split("/").reverse().join("");
    const index = parseInt(seed) % normalized.length;
    setCorrectFighter(normalized[index]);

    //Restore saved game state if the user already played today
    const savedState = JSON.parse(localStorage.getItem("fotdGameState"));
if (savedState && savedState.date === today) {
  setGuesses(savedState.guesses);
  setGameOver(savedState.gameOver);
  setHasWon(savedState.hasWon);
  setShowPopup(savedState.gameOver); // show result popup again
}

//Load global stats for today (to display success rate %)
const globalStats = JSON.parse(localStorage.getItem("fotdGlobalStats")) || {};
if (globalStats[today]) {
  const { plays, wins } = globalStats[today];
  setGlobalSuccessRate(plays > 0 ? Math.round((wins / plays) * 100) : null);
}

//Handle mobile layout toggle
setIsMobileView(window.innerWidth <= 768);

    //Window resize listener to update confetti width/height
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // === EFFECT: Watch and persist dark mode state to localStorage and <html> class ===
  useEffect(() => {
    localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  

  // === EFFECT: Update local stats when the game ends ===
useEffect(() => {
    if (gameOver) {
      // Load existing stats or set default if first time
      const stats = JSON.parse(localStorage.getItem('ufcStats')) || {
        played: 0,
        wins: 0,
        currentStreak: 0,
        maxStreak: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 },
        lastPlayedDate: null
      };
  
      const today = devDateOverride || new Date().toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" });
  
      // Only update stats once per day
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
        setStats(stats); // update state
      }
    }
  }, [gameOver]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowPopup(false);
      }
    };
  
    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopup]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (statsModalRef.current && !statsModalRef.current.contains(e.target)) {
        setShowStatsModal(false);
      }
    };
  
    if (showStatsModal) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
  
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showStatsModal]);
  
  
  
  // === Handle user guess submission ===
  const handleGuess = () => {
    if (gameOver || !input.trim()) return;
  
    // Try to match input to a valid fighter name
    const guess = fighters.find(
      (fighter) =>
        fighter.Name &&
        fighter.Name.toLowerCase() === input.toLowerCase()
    );
  
    if (!guess) return;
  
    // Add guess to history and clear input
    const newGuesses = [...guesses, guess];
    setGuesses(newGuesses);
    setInput('');
    setShowSuggestions(false); // hide suggestions
    setHighlightedIndex(-1);   // reset arrow navigation
  
    // Check if guess is correct or if game is over
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
  
    // === Save daily game state to localStorage ===
    const today = new Date().toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" });
    localStorage.setItem("fotdGameState", JSON.stringify({
      date: today,
      guesses: [...newGuesses],
      gameOver: guess.Name === correctFighter.Name || newGuesses.length >= 6,
      hasWon: guess.Name === correctFighter.Name
    }));
  
    // === Update global stats for today ===
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
  
  // === Allow guess submission with Enter key ===
  const handleKeyPress = (e) => {
    const filteredSuggestions = fighters
      .filter((f) => f.Name && f.Name.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 5);
  
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? filteredSuggestions.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        const selected = filteredSuggestions[highlightedIndex];
        setInput(selected.Name);
        setShowSuggestions(false);
        handleGuess(); // call this if you're using selected.Name
      } else {
        handleGuess(); // fallback if just pressing enter
      }
      setHighlightedIndex(-1); // reset
    }
  };
  
  

  // === Determine cell color based on guess accuracy ===
const getCellColor = (key, value) => {
    if (!correctFighter) return 'bg-gray-600'; // no answer loaded yet
    const correctValue = correctFighter?.[key];
  
    // If either value is unknown, gray it out
    if (!value || !correctValue || value === "Unknown" || correctValue === "Unknown") {
      return 'bg-gray-600';
    }
  
    // Exact match
    if (value === correctValue) return 'bg-green-600';
  
    // === Special logic by category ===
  
    // Country: yellow if on same continent
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
  
    // Age, Height, Fights: yellow if close (within ±2 or ±5)
    if (['Age', 'Height', 'UFC Fights', 'MMA Fights'].includes(key)) {
      const diff = Math.abs(Number(value) - Number(correctValue));
      if (key === 'Age' || key === 'Height') {
        return diff <= 2 ? 'bg-yellow-500' : 'bg-gray-600';
      } else {
        return diff <= 5 ? 'bg-yellow-500' : 'bg-gray-600';
      }
    }
  
    // Weight Class: yellow if within one class
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
  
    // Default: gray (no match)
    return 'bg-gray-600';
  };

  const getDisplayValue = (key, value) => {
    if (!correctFighter || !isEasyMode) return value;
  
    const correctValue = correctFighter[key];
    if (!value || !correctValue || value === "Unknown" || correctValue === "Unknown") {
      return value;
    }
  
    const numericKeys = ['Age', 'Height', 'UFC Fights', 'MMA Fights'];
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
  
    if (numericKeys.includes(key)) {
      const diff = Number(value) - Number(correctValue);
      if (Math.abs(diff) === 0 || isNaN(diff)) return value;
      const arrow = diff > 0 ? '▼' : '▲';
      return `${value} ${arrow}`;
    }
  
    if (key === 'Weight Class') {
      const guessedIndex = weightOrder.indexOf(value);
      const correctIndex = weightOrder.indexOf(correctValue);
      if (guessedIndex === -1 || correctIndex === -1) return value;
  
      const diff = guessedIndex - correctIndex;
      if (diff === 0) return value;
  
      const arrow = diff > 0 ? '▼' : '▲';
      return `${value} ${arrow}`;
    }
  
    return value;
  };
  
  
  // === Reset game to re-guess same fighter of the day ===
  const resetGame = () => {
    const today = devDateOverride || new Date().toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" });
    const seed = today.split("/").reverse().join("");
    const index = parseInt(seed) % fighters.length;
    setCorrectFighter(fighters[index]); // same fighter reused
    setGuesses([]);
    setInput('');
    setGameOver(false);
    setShowPopup(false);
    setHasWon(false);
    setShowConfetti(false);
  };
  
  // === Generate emoji summary and copy/share result ===
  const copyShareResult = () => {
    const emojiMap = {
      green: '🟩',
      yellow: '🟨',
      gray: '⬛'
    };
  
    // Convert guess rows to emoji color strings
    const shareText = guesses.map((guess) => {
      return dataKeys.map((key) => {
        const color = getCellColor(key, guess[key]);
        if (color.includes('green')) return emojiMap.green;
        if (color.includes('yellow')) return emojiMap.yellow;
        return emojiMap.gray;
      }).join('');
    }).join('\n');
  
    // Get today's date (e.g. "4.10")
    const date = new Date().toLocaleDateString("en-US", {
      timeZone: "America/Los_Angeles",
      month: 'numeric',
      day: 'numeric',
    }).replace('/', '.');
  
    // Build header line for share result
    const header = `🥊 ${date} FOTD ${hasWon ? guesses.length : 'X'}/6`;
  
    // Attempt to use native share, fallback to clipboard
    if (navigator.share) {
      navigator.share({
        title: "UFC Fighter Guess",
        text: `${header}\n${shareText}`,
      }).catch(err => console.error("Error sharing:", err));
    } else {
      navigator.clipboard.writeText(`${header}\n${shareText}`)
        .then(() => setCopied(true))
        .catch(() => console.error('Failed to copy'));
    }
  };    

  // === Build out guess row placeholders for rendering ===
const guessRows = [...guesses];
// Always fill up to 6 rows, adding null placeholders if needed
while (guessRows.length < 6) {
  guessRows.push(null);
}

// Keys to show in the game grid (column headers)
const dataKeys = ['Name', 'Country', 'Weight Class', 'Age', 'Height', 'UFC Fights', 'MMA Fights'];

return (
  <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
    <div className="max-w-6xl mx-auto py-6 px-4">

      {/* ====== Header Section (Mobile/Desktop Responsive) ====== */}
      {isMobileView ? (
        // --- MOBILE HEADER ---
        <div className="mb-4">
          <div className="flex flex-col items-center space-y-2 mb-4 text-center">
            <img src={ufcLogo} alt="UFC Logo" className="h-8" />
            <h1 className="text-3xl font-bold">
              Fighter Guess{window.location.pathname.includes("unlimited") ? " - Unlimited" : ""}
            </h1>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
          <a
  href="/"
  className="flex items-center h-10 text-sm bg-gray-300 dark:bg-gray-700 px-4 rounded"
>
  FOTD
</a>
<a
  href="/unlimited"
  className="flex items-center h-10 text-sm bg-gray-300 dark:bg-gray-700 px-4 rounded"
>
  Unlimited
</a>

            <button
  onClick={() => setIsEasyMode((prev) => !prev)}
  className="p-2 rounded-md border dark:border-gray-700 bg-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition text-sm"
>
  {isEasyMode ? "Easy Mode" : "Hard Mode"}
</button>
<div className="relative user-dropdown">
  <button
    onClick={() => setShowUserMenu(!showUserMenu)}
    className="p-2 rounded-full border dark:border-gray-700 bg-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
  >
    <UserCircle size={24} className="text-black dark:text-white" />
  </button>

  {showUserMenu && (
    <div className="absolute right-0 mt-2 w-52 animate-[fadeIn_0.15s_ease-out] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-md z-50">
      <div className="border-b border-gray-200 dark:border-gray-700">
        {user?.username ? (
          <div className="px-4 py-2 text-sm text-gray-800 dark:text-white">
            Signed in as <strong>
              {user.username
                .split(/[\s._-]/)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' ')}
            </strong>
          </div>
        ) : (
          <SignInButton mode="redirect">
            <div className="px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              🔓 Login to save your stats
            </div>
          </SignInButton>
        )}
      </div>

      <button
        onClick={() => setIsDarkMode((prev) => !prev)}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
      >
        Toggle {isDarkMode ? "Light" : "Dark"} Mode
      </button>

      <button
        onClick={() => setIsMobileView((prev) => !prev)}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
      >
        Toggle {isMobileView ? "Desktop" : "Mobile"} View
      </button>

      <button
  onClick={() => setShowStatsModal(true)}
  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
>
  View Stats
</button>


      {user && (
        <button
          onClick={() => {
            setShowUserMenu(false);
            signOut();
            localStorage.removeItem("guestMode");
          }}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Log Out
        </button>
      )}
    </div>
  )}
</div>


          </div>
        </div>
      ) : (
        // --- DESKTOP HEADER ---
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <img src={ufcLogo} alt="UFC Logo" className="h-8" />
            <h1 className="text-4xl font-bold">Fighter Guess</h1>
          </div>
          <div className="flex space-x-2">
  <a href="/" className="flex items-center text-sm bg-gray-300 dark:bg-gray-700 px-2 py-1 rounded">Fighter of the Day</a>
  <a href="/unlimited" className="flex items-center text-sm bg-gray-300 dark:bg-gray-700 px-2 py-1 rounded">Unlimited Mode</a>
  
  <button
  onClick={() => setIsEasyMode((prev) => !prev)}
  className="p-2 rounded-md border dark:border-gray-700 bg-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition text-sm"
>
  {isEasyMode ? "Easy Mode" : "Hard Mode"}
</button>



  <div className="relative user-dropdown">
    <button
      onClick={() => setShowUserMenu(!showUserMenu)}
      className="p-2 rounded-full border dark:border-gray-700 bg-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
    >
      <UserCircle size={24} className="text-black dark:text-white" />
    </button>

    {showUserMenu && (
      <div className="absolute right-0 mt-2 w-52 animate-[fadeIn_0.15s_ease-out] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-md z-50">
        <div className="border-b border-gray-200 dark:border-gray-700">
  {user?.username ? (
    <div className="px-4 py-2 text-sm text-gray-800 dark:text-white">
      Signed in as <strong>
        {user.username
          .split(/[\s._-]/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ')}
      </strong>
    </div>
  ) : (
    <SignInButton mode="redirect">
      <div className="px-4 py-2 text-sm text-white-600 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
        Login to save stats!
      </div>
    </SignInButton>
  )}
</div>


        <button
          onClick={() => setIsDarkMode((prev) => !prev)}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
        >
          Toggle {isDarkMode ? "Light" : "Dark"} Mode
        </button>

        <button
          onClick={() => setIsMobileView((prev) => !prev)}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
        >
          Toggle {isMobileView ? "Desktop" : "Mobile"} View
        </button>

        <button
  onClick={() => setShowStatsModal(true)}
  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
>
  View Stats
</button>


        <button
          onClick={() => {
            setShowUserMenu(false);
            signOut();
          }}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Log Out
        </button>
      </div>
    )}
  </div>
</div>

        </div>
      )}

      {/* ====== Input Field and Suggestion Box ====== */}
      <div className="flex items-center mb-4">
        <div className="relative w-full mr-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
                setInput(e.target.value);
                setHighlightedIndex(-1);
                setShowSuggestions(true); // <–– 🔥 KEY LINE: force it to show while typing
              }}                            
            onKeyDown={handleKeyPress}
            onFocus={() => {
                setShowSuggestions(true);
                setHighlightedIndex(-1);
              }}              
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            placeholder="Enter fighter name"
            className="w-full border p-2 rounded text-black"
            disabled={gameOver}
          />

{/* ====== Autocomplete Dropdown for Fighter Suggestions ====== */}
{showSuggestions && input && (
  <div className="absolute left-0 right-0 top-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded mt-1 z-50 max-h-40 overflow-y-auto shadow-md">
    {fighters
      .filter((fighter) => fighter.Name) // skip blanks
      .sort((a, b) => {
        // Improve relevance by ranking based on first/last name match
        const inputLower = input.toLowerCase();

        const aName = a.Name.toLowerCase();
        const bName = b.Name.toLowerCase();

        const [aFirst, ...aRest] = aName.split(" ");
        const [bFirst, ...bRest] = bName.split(" ");

        const aLast = aRest.join(" ");
        const bLast = bRest.join(" ");

        const aScore =
          aFirst.startsWith(inputLower) ? 0 :
          aLast.startsWith(inputLower) ? 1 :
          aName.includes(inputLower) ? 2 : 3;

        const bScore =
          bFirst.startsWith(inputLower) ? 0 :
          bLast.startsWith(inputLower) ? 1 :
          bName.includes(inputLower) ? 2 : 3;

        return aScore - bScore;
      })
      .filter((fighter) =>
        fighter.Name.toLowerCase().includes(input.toLowerCase())
      )
      .slice(0, 5) // max 5 suggestions
      .map((fighter, index) => (
        <div
  key={index}
  onMouseDown={() => {
    setInput(fighter.Name);
    setShowSuggestions(false);
    handleGuess(); // optional: auto-submit on click
  }}
  className={`px-3 py-1 cursor-pointer ${
    index === highlightedIndex
      ? 'bg-gray-300 dark:bg-gray-600'
      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
  }`}
>

          {/* Highlight matched text in bold */}
          {(() => {
            const name = fighter.Name;
            const lowerName = name.toLowerCase();
            const lowerInput = input.toLowerCase();
            const matchIndex = lowerName.indexOf(lowerInput);

            if (matchIndex === -1) return name;

            const before = name.slice(0, matchIndex);
            const match = name.slice(matchIndex, matchIndex + input.length);
            const after = name.slice(matchIndex + input.length);

            return (
              <>
                {before}
                <span className="font-bold">{match}</span>
                {after}
              </>
            );
          })()}
        </div>
      ))}
  </div>
)}

</div> {/* end of input container */}

{/* ====== Guess Button ====== */}
<button
  onClick={handleGuess}
  className="bg-blue-600 text-white px-4 py-2 rounded"
  disabled={gameOver}
>
  Guess
</button>
</div> {/* end of input + button row */}


{/* ====== Mobile Layout Grid ====== */}
{isMobileView ? (
  <div className="w-full overflow-x-auto">
    <div className="flex">
      {/* Column headers (left side) */}
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

      {/* ====== Mobile Layout: Each guess as a vertical column ====== */}
<div className="flex overflow-x-auto space-x-2">
  {guessRows.map((guess, guessIndex) => (
    <div key={guessIndex} className="flex flex-col space-y-2">
      {dataKeys.map((key, i) => (
        <div
          key={i}
          className={`w-28 h-12 flex items-center justify-center rounded text-white font-medium text-center ${guess ? getCellColor(key, guess[key]) : 'bg-gray-800 text-gray-400'}`}
        >
          {guess ? getDisplayValue(key, guess[key]) : '—'}
        </div>
      ))}
    </div>
  ))}
</div>
</div>
</div>
) : (

  // ====== Desktop Layout: Each guess as a horizontal row ======
  <div className="overflow-x-auto w-full">
    <div className="min-w-[700px]">

      {/* Column headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dataKeys.map((header) => (
          <div key={header} className="font-semibold text-center">
            {header}
          </div>
        ))}
      </div>

      {/* Rows for each guess or empty row */}
      {guessRows.map((guess, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-7 gap-2 mb-2">
          {guess ? (
            dataKeys.map((key, index) => (
              <div
                key={index}
                className={`p-2 rounded text-center text-white font-medium ${getCellColor(key, guess[key])}`}
              >
                {getDisplayValue(key, guess[key])}
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

{/* ====== End Game Popup (win or lose) ====== */}
{showPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

    {/* Confetti animation when user wins */}
    {showConfetti && (
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        numberOfPieces={300}
        recycle={false}
      />
    )}

    {/* Popup modal content */}
    <div
  ref={popupRef}
  className="bg-white dark:bg-gray-800 p-6 rounded shadow-md text-center relative w-80"
>

      <button
        onClick={() => setShowPopup(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
      >
        ✖
      </button>

      {/* Display win or lose message */}
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
      <p className="mb-4">
        Guess the UFC fighter in 6 tries. Each guess will give you clues on how close you are in categories like country, weight class, age, height, and fight stats.
      </p>

      <div className="space-y-3">
        {/* Gray - Not Close */}
        <div className="flex items-center space-x-3">
          <div className="min-w-[160px] h-10 bg-gray-600 text-white rounded flex items-center justify-center font-medium">—</div>
          <span className="text-sm text-black dark:text-white">Not close</span>
        </div>

        {/* Yellow - Country */}
        <div className="flex items-center space-x-3">
          <div className="min-w-[160px] h-10 bg-yellow-500 text-white rounded flex items-center justify-center font-medium">Country</div>
          <span className="text-sm text-black dark:text-white">Correct Continent, Wrong Country</span>
        </div>

        {/* Yellow - Weight Class */}
        <div className="flex items-center space-x-3">
          <div className="min-w-[160px] h-10 bg-yellow-500 text-white rounded flex items-center justify-center font-medium">Weight Class</div>
          <span className="text-sm text-black dark:text-white">Within One Weight Class</span>
        </div>

        {/* Yellow - Age / Height */}
        <div className="flex items-center space-x-3">
          <div className="min-w-[160px] h-10 bg-yellow-500 text-white rounded flex items-center justify-center font-medium">Age / Height</div>
          <span className="text-sm text-black dark:text-white">Within ±2 of Age or Height</span>
        </div>

        {/* Yellow - Fights */}
        <div className="flex items-center space-x-3">
          <div className="min-w-[160px] h-10 bg-yellow-500 text-white rounded flex items-center justify-center font-medium">Number of Fights</div>
          <span className="text-sm text-black dark:text-white">Within ±5 of Number of Fights</span>
        </div>

        {/* Green - Correct */}
        <div className="flex items-center space-x-3">
          <div className="min-w-[160px] h-10 bg-green-600 text-white rounded flex items-center justify-center font-medium">✔</div>
          <span className="text-sm text-black dark:text-white">Exactly Correct for Category</span>
        </div>
      </div>
    </div>
  </div>
)}

{showStatsModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div
      ref={statsModalRef}
      className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-[90%] max-w-md text-left relative"
    >
      <button
        onClick={() => setShowStatsModal(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
      >
        ✖
      </button>

      {(!user || guestMode) ? (
        <div className="text-center text-gray-800 dark:text-white">
          <p className="text-lg font-semibold mb-2">You're playing as a guest</p>
          <p className="mb-4">Log in to save and view your stats!</p>
          <SignInButton mode="redirect">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Log In
            </button>
          </SignInButton>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-4 space-x-4">
            <button
              onClick={() => setStatsTab("fotd")}
              className={`px-3 py-1 rounded ${
                statsTab === "fotd"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 dark:bg-gray-600 text-black dark:text-white"
              }`}
            >
              Fighter of the Day
            </button>
            <button
              onClick={() => setStatsTab("unlimited")}
              className={`px-3 py-1 rounded ${
                statsTab === "unlimited"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 dark:bg-gray-600 text-black dark:text-white"
              }`}
            >
              Unlimited
            </button>
          </div>

          <div className="text-white text-sm space-y-2">
  <p>
    Games Played:{" "}
    {statsTab === "fotd" ? fotdStats?.played ?? 0 : userStats?.gamesPlayed ?? 0}
  </p>
  <p>
    Games Won:{" "}
    {statsTab === "fotd" ? fotdStats?.wins ?? 0 : userStats?.gamesWon ?? 0}
  </p>
  <p>
    Win %:{" "}
    {(() => {
      const wins = statsTab === "fotd" ? fotdStats?.wins ?? 0 : userStats?.gamesWon ?? 0;
      const played = statsTab === "fotd" ? fotdStats?.played ?? 0 : userStats?.gamesPlayed ?? 0;
      return played > 0 ? Math.round((wins / played) * 100) : 0;
    })()}
    %
  </p>
  <p>
    Current Streak:{" "}
    {statsTab === "fotd"
      ? fotdStats?.currentStreak ?? 0
      : userStats?.currentStreak ?? 0}
  </p>
  <p>
    Max Streak:{" "}
    {statsTab === "fotd"
      ? fotdStats?.maxStreak ?? 0
      : userStats?.maxStreak ?? 0}
  </p>

  <h4 className="font-semibold mt-4">Guess Distribution</h4>
{Object.entries(
  statsTab === "fotd"
    ? fotdStats?.distribution ?? {}
    : userStats?.distribution ?? {}
).map(([key, val]) => (
  <div key={key} className="flex items-center space-x-2 my-1">
    <span className="w-4">{key}</span>
    <div
      className="h-4 rounded bg-gray-400 text-xs text-white text-center"
      style={{
        width: `${val * 10}px`,
        backgroundColor: 'gray',
      }}
    >
      {val}
      </div>
    </div>
))}


</div>

        </>
      )}
    </div>
  </div>
)}


</div>
);
}

export default App;
