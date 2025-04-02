import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const UnlimitedLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter a username and password.');
      return;
    }

    const { data: existingUser, error: fetchError } = await supabase
      .from('unlimited_scores')
      .select('*')
      .eq('username', username)
      .single();

    if (existingUser) {
      if (existingUser.password !== password) {
        setError('Incorrect password.');
        return;
      }
      onLogin(existingUser);
    } else {
      const { data: newUser, error: insertError } = await supabase
        .from('unlimited_scores')
        .insert([
          {
            username,
            password,
            games_played: 0,
            games_won: 0,
            avg_score: 0,
          },
        ])
        .select()
        .single();

      if (insertError) {
        setError('Error creating account.');
        return;
      }

      onLogin(newUser);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4 text-center">Login to Unlimited Mode</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <input
        className="w-full mb-2 p-2 border rounded text-black"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="w-full mb-2 p-2 border rounded text-black"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Enter Unlimited Mode
      </button>
    </div>
  );
};

export default UnlimitedLogin;
