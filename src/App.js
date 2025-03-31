// UFC Fighter Guessing Game (Basic Web Version)
// Updated layout and logic with horizontal row display and autocomplete

import React, { useState, useEffect } from 'react';
import fighters from './fighters.json';
<img src="https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/UFC_Logo.svg/2560px-UFC_Logo.svg.png" alt="UFC Logo" className="h-10 mr-3" />


const getRandomFighter = () => {
  return fighters[Math.floor(Math.random() * fighters.length)];
};

const getContinent = (country) => {
  const continentMap = {
    "USA": "North America",
    "Canada": "North America",
    "Brazil": "South America",
    "Russia": "Europe",
    "UK": "Europe",
    "Ireland": "Europe",
    "Nigeria": "Africa",
    "Australia": "Oceania",
    "New Zealand": "Oceania"
  };
  return continentMap[country] || 'Other';
};

const compareAttributes = (guess, answer) => {
  const feedback = {};

  feedback.name = guess.name === answer.name ? 'green' : 'gray';

  const weightClasses = [
    "Flyweight", "Bantamweight", "Featherweight", "Lightweight",
    "Welterweight", "Middleweight", "Light Heavyweight", "Heavyweight"
  ];
  const guessIndex = weightClasses.indexOf(guess.weight_class);
  const answerIndex = weightClasses.indexOf(answer.weight_class);
  feedback.weight_class =
    guess.weight_class === answer.weight_class
      ? 'green'
      : Math.abs(guessIndex - answerIndex) === 1
      ? 'goldenrod'
      : 'gray';

  feedback.country =
    guess.country === answer.country
      ? 'green'
      : getContinent(guess.country) === getContinent(answer.country)
      ? 'goldenrod'
      : 'gray';

  ['age', 'height', 'total_ufc_fights', 'debut_year'].forEach((key) => {
    feedback[key] =
      guess[key] === answer[key]
        ? 'green'
        : Math.abs(guess[key] - answer[key]) <= 2
        ? 'goldenrod'
        : 'gray';
  });

  return feedback;
};

const FighterRow = ({ guess, feedback }) => {
  return (
    <div className="grid grid-cols-7 gap-2 mb-2">
      {[
        "name",
        "weight_class",
        "country",
        "age",
        "height",
        "total_ufc_fights",
        "debut_year"
      ].map((key, i) => (
        <div
          key={i}
          className="p-2 rounded text-white text-sm text-center"
          style={{ backgroundColor: feedback[key] || 'gray' }}
        >
          {guess[key]}
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [answer, setAnswer] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setAnswer(getRandomFighter());
  }, []);

  const handleGuess = () => {
    const guess = fighters.find(f => f.name.toLowerCase() === input.toLowerCase());
    if (!guess) {
      setMessage("Fighter not found.");
      return;
    }
    const feedback = compareAttributes(guess, answer);
    const newGuesses = [...guesses, { guess, feedback }];
    setGuesses(newGuesses);
    setInput('');

    if (guess.name === answer.name) {
      setGameOver(true);
      setMessage("Correct! You got it.");
    } else if (newGuesses.length === 6) {
      setGameOver(true);
      setMessage(`Out of guesses. The fighter was ${answer.name}.`);
    } else {
      setMessage("");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center mb-4">
        <img src={ufcLogo} alt="UFC Logo" className="h-10 mr-3" />
        <h1 className="text-2xl font-bold">Fighter Guess</h1>
      </div>

      <div className="mb-4">
        <input
          list="fighters"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter fighter name"
          className="border p-2 rounded mr-2"
          disabled={gameOver}
        />
        {input.length > 0 && (
          <datalist id="fighters">
            {fighters.map((fighter, index) => (
              <option key={index} value={fighter.name} />
            ))}
          </datalist>
        )}
        <button
          onClick={handleGuess}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={gameOver}
        >
          Guess
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 font-semibold text-center mb-2">
        <div>Name</div>
        <div>Weight</div>
        <div>Country</div>
        <div>Age</div>
        <div>Height</div>
        <div>Fights</div>
        <div>Debut</div>
      </div>

      <div className="space-y-2">
        {guesses.map((entry, idx) => (
          <FighterRow
            key={idx}
            guess={entry.guess}
            feedback={entry.feedback}
          />
        ))}
      </div>

      {message && <p className="mt-4 text-lg font-semibold">{message}</p>}
    </div>
  );
} 
