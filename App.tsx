import React, { useState } from 'react';
import { GameState, Team } from './types';
import GameLobby from './components/GameLobby';
import Gameplay from './components/Gameplay';
import { Gift, Snowflake } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
  const [teams, setTeams] = useState<Team[]>([]);

  const handleStartGame = (gameTeams: Team[]) => {
    setTeams(gameTeams);
    setGameState(GameState.TURN_START);
  };

  const handleGameEnd = (finalTeams: Team[]) => {
    setTeams(finalTeams);
    setGameState(GameState.GAME_OVER);
  };

  const handleScoreUpdate = (teamId: number) => {
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.id === teamId ? { ...team, score: team.score + 1 } : team
      )
    );
  };

  const restartGame = () => {
    setGameState(GameState.LOBBY);
    setTeams([]);
  };

  return (
    <div className="min-h-screen snow-bg flex flex-col font-sans text-gray-800">
      
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-red-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setGameState(GameState.LOBBY)}>
             <div className="bg-red-600 text-white p-2 rounded-lg transform -rotate-6 shadow-md">
                <Gift size={24} />
             </div>
             <h1 className="text-2xl md:text-3xl font-bold font-christmas text-red-700 tracking-tight">
               Christmas <span className="text-green-700">Pictionary</span>
             </h1>
          </div>

          {gameState !== GameState.LOBBY && (
             <div className="flex items-center gap-4">
                {teams.map(team => (
                    <div key={team.id} className="flex flex-col items-center">
                        <span className={`text-[10px] uppercase font-bold ${team.color.replace('bg-', 'text-')}`}>
                            {team.name}
                        </span>
                        <span className="font-black text-xl leading-none">{team.score}</span>
                    </div>
                ))}
             </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Decorative Snowflakes */}
        <div className="absolute top-10 left-10 text-red-200 opacity-50 pointer-events-none animate-pulse">
            <Snowflake size={48} />
        </div>
        <div className="absolute bottom-20 right-10 text-green-200 opacity-50 pointer-events-none animate-bounce">
             <Snowflake size={64} />
        </div>

        <div className="w-full h-full flex-1">
            {gameState === GameState.LOBBY && (
                <GameLobby onStartGame={handleStartGame} />
            )}
            
            {(gameState === GameState.TURN_START || gameState === GameState.DRAWING || gameState === GameState.SCORING) && (
                <Gameplay 
                  teams={teams} 
                  onGameEnd={handleGameEnd} 
                  onScoreUpdate={handleScoreUpdate}
                />
            )}
            
            {gameState === GameState.GAME_OVER && (
                 <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                    <h2 className="text-5xl font-christmas font-bold text-red-600 mb-8">Game Over!</h2>
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                        {teams.sort((a,b) => b.score - a.score).map((team, idx) => (
                            <div key={team.id} className="flex items-center justify-between py-4 border-b last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold text-gray-300">#{idx + 1}</span>
                                    <span className="font-bold text-lg">{team.name}</span>
                                </div>
                                <span className="text-2xl font-bold text-green-600">{team.score} pts</span>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={restartGame}
                        className="mt-8 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105"
                    >
                        Play Again
                    </button>
                 </div>
            )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-400 text-sm">
        <p>Merry Christmas! • Made for Family Fun</p>
      </footer>
    </div>
  );
};

export default App;