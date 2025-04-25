import React from 'react';
import Confetti from 'react-confetti';
import UnlimitedLeaderboard from '../UnlimitedLeaderboard'; // only used if isUnlimitedMode
import { SignInButton } from '@clerk/clerk-react';

// Static config
const dataKeys = ['Name', 'Country', 'Weight Class', 'Age', 'Height', 'UFC Fights', 'MMA Fights'];

// === Utility Function: Cell Color ===
const getCellColor = (key, value, correctFighter) => {
  if (!correctFighter) return 'bg-gray-600';
  const correctValue = correctFighter?.[key];

  if (!value || !correctValue || value === "Unknown" || correctValue === "Unknown") return 'bg-gray-600';
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
    return (key === 'Age' || key === 'Height') ? (diff <= 2 ? 'bg-yellow-500' : 'bg-gray-600') : (diff <= 5 ? 'bg-yellow-500' : 'bg-gray-600');
  }

  if (key === 'Weight Class') {
    const weightOrder = ['Strawweight', 'Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight', 'Welterweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight'];
    const guessedIndex = weightOrder.indexOf(value);
    const correctIndex = weightOrder.indexOf(correctValue);
    if (guessedIndex === -1 || correctIndex === -1) return 'bg-gray-600';
    const diff = Math.abs(guessedIndex - correctIndex);
    return diff === 1 ? 'bg-yellow-500' : 'bg-gray-600';
  }

  return 'bg-gray-600';
};

// === Utility Function: Display Value with Arrows ===
const getDisplayValue = (key, value, correctFighter, isEasyMode) => {
  if (!correctFighter || !isEasyMode) return value;
  const correctValue = correctFighter[key];
  if (!value || !correctValue || value === "Unknown" || correctValue === "Unknown") return value;

  const numericKeys = ['Age', 'Height', 'UFC Fights', 'MMA Fights'];
  const weightOrder = ['Strawweight', 'Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight', 'Welterweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight'];

  if (numericKeys.includes(key)) {
    const diff = Number(value) - Number(correctValue);
    if (isNaN(diff) || diff === 0) return value;
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

// === Component Shell (rest of layout coming soon) ===
const GameLayout = ({
  fighters,
  guesses,
  correctFighter,
  gameOver,
  hasWon,
  input,
  setInput,
  handleGuess,
  isEasyMode,
  isMobileView,
  highlightedIndex,
  setHighlightedIndex,
  showSuggestions,
  setShowSuggestions,
  showPopup,
  setShowPopup,
  showConfetti,
  windowSize,
  resetGame,
  optionalStats,
  optionalSuccessRate,
  isUnlimitedMode
}) => {
  
  const guessRows = [...guesses];
  while (guessRows.length< 6) {
    guessRows.push(null);
  }

    // We'll build out layout + rendering next
  return (
    <div>
      {/* Game UI will go here */}
        {/* ===== Input & Autocomplete ===== */}
  <div className="flex items-center mb-4">
    <div className="relative w-full mr-2">
      <input
        type="text"
        value={input}
        onChange={e => {
          setInput(e.target.value);
          setHighlightedIndex(-1);
          setShowSuggestions(true);
        }}
        onKeyDown={e => {
          const suggestions = fighters
            .filter(f => f.Name && f.Name.toLowerCase().includes(input.toLowerCase()))
            .slice(0, 5);

          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) =>
              prev <= 0 ? suggestions.length - 1 : prev - 1
            );
          }
          if (e.key === 'Enter') {
            if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
              setInput(suggestions[highlightedIndex].Name);
              setShowSuggestions(false);
            }
            handleGuess();
            setHighlightedIndex(-1);
          }
        }}
        onFocus={() => {
          setShowSuggestions(true);
          setHighlightedIndex(-1);
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        placeholder="Enter fighter name"
        className="w-full border p-2 rounded text-black dark:text-white"
        disabled={gameOver}
      />

      {showSuggestions && input && (
        <div className="absolute left-0 right-0 top-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded mt-1 z-50 max-h-40 overflow-y-auto shadow-md">
          {fighters
            .filter(f => f.Name && f.Name.toLowerCase().includes(input.toLowerCase()))
            .slice(0, 5)
            .map((fighter, idx) => (
              <div
                key={idx}
                onMouseDown={() => {
                  setInput(fighter.Name);
                  setShowSuggestions(false);
                  handleGuess();
                }}
                className={`px-3 py-1 cursor-pointer ${
                  idx === highlightedIndex
                    ? 'bg-gray-300 dark:bg-gray-600'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {(() => {
                  const name = fighter.Name;
                  const lower = name.toLowerCase();
                  const matchIndex = lower.indexOf(input.toLowerCase());
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
    </div>

    <button
      onClick={handleGuess}
      className="bg-blue-600 text-white px-4 py-2 rounded"
      disabled={gameOver}
    >
      Guess
    </button>
  </div>

  {/* ===== Game Grid ===== */}
  {isMobileView ? (
    // Mobile: column headers on left, guesses to the right
    <div className="w-full overflow-x-auto">
      <div className="flex">
        {/* Headers */}
        <div className="flex flex-col flex-shrink-0 mr-2 space-y-2">
          {dataKeys.map(key => (
            <div
              key={key}
              className="w-28 h-12 flex items-center justify-center rounded bg-transparent text-black dark:text-white font-medium text-center"
            >
              {key}
            </div>
          ))}
        </div>
        {/* Guesses */}
        <div className="flex overflow-x-auto space-x-2">
          {guessRows.map((guess, idx) => (
            <div key={idx} className="flex flex-col space-y-2">
              {dataKeys.map((key, i) => (
                <div
                  key={i}
                  className={`w-28 h-12 flex items-center justify-center rounded text-white font-medium text-center ${
                    guess
                      ? getCellColor(key, guess[key], correctFighter)
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {guess
                    ? getDisplayValue(key, guess[key], correctFighter, isEasyMode)
                    : '—'}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : (
    // Desktop: column headers on top, one row per guess
    <div className="overflow-x-auto w-full">
      <div className="min-w-[700px]">
        {/* Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dataKeys.map(header => (
            <div key={header} className="font-semibold text-center">
              {header}
            </div>
          ))}
        </div>
        {/* Guess rows */}
        {guessRows.map((guess, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7 gap-2 mb-2">
            {guess ? (
              dataKeys.map((key, colIndex) => (
                <div
                  key={colIndex}
                  className={`p-2 rounded text-center text-white font-medium ${
                    getCellColor(key, guess[key], correctFighter)
                  }`}
                >
                  {getDisplayValue(key, guess[key], correctFighter, isEasyMode)}
                </div>
              ))
            ) : (
              Array(7)
                .fill(null)
                .map((_, emptyIndex) => (
                  <div
                    key={emptyIndex}
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


    </div>
  );
};

export default GameLayout;
