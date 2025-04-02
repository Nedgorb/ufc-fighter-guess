import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const UnlimitedLeaderboard = () => {
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('unlimited_scores')
        .select('username, games_won')
        .order('games_won', { ascending: false })
        .limit(10);

      if (error) console.error('Error fetching leaderboard:', error);
      else setTopUsers(data);
    };

    fetchLeaderboard();
  }, []);

  if (topUsers.length === 0) return null;

  const podium = topUsers.slice(0, 3);
  const rest = topUsers.slice(3);

  return (
    <div className="mt-10 text-center">
      <h2 className="text-2xl font-bold mb-6">🏆 Leaderboard</h2>

      {/* Podium */}
      <div className="flex justify-center items-end gap-4 mb-6 max-w-[300px] mx-auto">
  {/* 2nd place */}
  {podium[1] && (
    <div className="flex flex-col items-center w-[80px]">
      <div className="bg-gray-400 text-white font-bold w-full text-center rounded-t-md">2nd</div>
      <div className="bg-silver h-24 w-full flex flex-col justify-center items-center rounded-b-md">
        <span className="font-semibold text-sm">{podium[1].username}</span>
        <span className="text-xs">{podium[1].games_won} wins</span>
      </div>
    </div>
  )}

  {/* 1st place */}
  {podium[0] && (
    <div className="flex flex-col items-center w-[80px]">
      <div className="bg-yellow-500 text-white font-bold w-full text-center rounded-t-md">1st</div>
      <div className="bg-gold h-32 w-full flex flex-col justify-center items-center rounded-b-md">
        <span className="font-bold text-sm">{podium[0].username}</span>
        <span className="text-xs">{podium[0].games_won} wins</span>
      </div>
    </div>
  )}

  {/* 3rd place */}
  {podium[2] && (
    <div className="flex flex-col items-center w-[80px]">
      <div className="bg-orange-400 text-white font-bold w-full text-center rounded-t-md">3rd</div>
      <div className="bg-bronze h-20 w-full flex flex-col justify-center items-center rounded-b-md">
        <span className="font-semibold text-sm">{podium[2].username}</span>
        <span className="text-xs">{podium[2].games_won} wins</span>
      </div>
    </div>
  )}
</div>


      {/* 4–10 */}
      <div className="max-w-md mx-auto">
        {rest.map((user, index) => (
          <div key={user.username} className="flex justify-between px-4 py-2 border-b">
            <span>{index + 4}. {user.username}</span>
            <span>{user.games_won} wins</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnlimitedLeaderboard;
