import React, { useState, useMemo } from 'react';
import { GameState, Team } from './types';
import { GameLobby } from './components/GameLobby';
import Gameplay from './components/Gameplay';
import { Gift, Snowflake, RefreshCw, Trophy, Crown, LogOut, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
  const [teams, setTeams] = useState<Team[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Detect if the app is running in an iframe
  const isEmbedded = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }, []);

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

  const handleExitRequest = () => {
    if (gameState === GameState.LOBBY) {
        // Force refresh if in lobby to clear all state
        window.location.reload();
    } else {
        setShowExitConfirm(true);
    }
  };

  const confirmExit = () => {
      setGameState(GameState.LOBBY);
      setShowExitConfirm(false);
  };

  // Sort teams for leaderboard display
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => b.score - a.score);
  }, [teams]);

  return (
    <div className={`min-h-screen ${isEmbedded ? 'bg-white' : 'snow-bg bg-red-50/30'} flex flex-col font-sans text-gray-800 overflow-x-hidden`}>
      
      {/* Header - Simplified if embedded */}
      {!isEmbedded ? (
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b-4 border-red-100 sticky top-0 z-50 transition-all duration-300">
          <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setGameState(GameState.LOBBY)}>
               <div className="bg-gradient-to-br from-red-500 to-red-700 text-white p-2.5 rounded-xl transform -rotate-6 shadow-lg group-hover:rotate-0 transition-transform duration-300 hidden sm:block border-2 border-red-400 border-opacity-50">
                  <Gift size={28} />
               </div>
               <div className="flex flex-col">
                   <h1 className="text-2xl md:text-3xl font-black font-christmas text-red-700 tracking-tight whitespace-nowrap leading-none">
                     Christmas <span className="text-green-700">Pictionary</span>
                   </h1>
                   <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 pl-1 hidden sm:block">Family Party Game</span>
               </div>
            </div>

            {gameState !== GameState.LOBBY && (
               <div className="flex items-center gap-3 md:gap-6 overflow-x-auto no-scrollbar pl-6 border-l-2 border-gray-100 ml-4">
                  {sortedTeams.map((team, index) => (
                      <div key={team.id} className="flex flex-col items-center flex-shrink-0 relative group">
                          {index === 0 && team.score > 0 && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-yellow-500 animate-bounce">
                                <Crown size={16} fill="currentColor" />
                            </div>
                          )}
                          <div className={`flex items-center justify-center gap-1 ${index === 0 && team.score > 0 ? 'scale-110 origin-bottom' : ''} transition-transform`}>
                              <div className={`w-2 h-2 rounded-full ${team.color} mt-1`}></div>
                              <span className={`text-xs uppercase font-bold ${team.color.replace('bg-', 'text-')} whitespace-nowrap max-w-[80px] truncate`}>
                                  {team.name}
                              </span>
                          </div>
                          <span className={`font-black text-3xl font-christmas leading-none ${index === 0 && team.score > 0 ? 'text-yellow-600 drop-shadow-sm' : 'text-gray-700'}`}>
                            {team.score}
                          </span>
                      </div>
                  ))}
               </div>
            )}
          </div>
        </header>
      ) : (
        /* Embedded Compact Header */
        <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
           {gameState === GameState.LOBBY ? (
               <div className="flex items-center gap-2">
                   <Gift size={18} className="text-red-600" />
                   <span className="font-christmas text-lg text-gray-800 font-bold leading-none">Christmas Pictionary</span>
               </div>
           ) : (
               <div className="flex gap-4 overflow-x-auto no-scrollbar">
                    {sortedTeams.map((team, index) => (
                        <div key={team.id} className="flex items-center gap-1.5">
                            {index === 0 && team.score > 0 && <Crown size={10} className="text-yellow-500" fill="currentColor" />}
                            <div className={`w-2 h-2 rounded-full ${team.color}`}></div>
                            <span className="text-xs font-bold text-gray-600 max-w-[60px] truncate">{team.name}</span>
                            <span className={`font-black text-lg ${index === 0 && team.score > 0 ? 'text-yellow-600' : 'text-gray-800'}`}>{team.score}</span>
                        </div>
                    ))}
               </div>
           )}
           
           <button 
               onClick={handleExitRequest} 
               className={`p-1 transition-colors ${gameState === GameState.LOBBY ? 'text-gray-400 hover:text-red-500' : 'text-red-400 hover:text-red-600'}`} 
               title={gameState === GameState.LOBBY ? "Reset" : "Exit Game"}
           >
               {gameState === GameState.LOBBY ? <RefreshCw size={16} /> : <LogOut size={16} />}
           </button>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 flex flex-col relative w-full ${isEmbedded ? 'p-0' : ''}`}>
        {/* Decorative Snowflakes */}
        {!isEmbedded && (
            <>
                <div className="hidden md:block absolute top-10 left-10 text-red-100 opacity-60 pointer-events-none animate-[pulse_3s_ease-in-out_infinite]">
                    <Snowflake size={64} />
                </div>
                <div className="hidden md:block absolute bottom-20 right-10 text-green-100 opacity-60 pointer-events-none animate-[bounce_3s_infinite]">
                    <Snowflake size={80} />
                </div>
                <div className="hidden lg:block absolute top-1/3 right-20 text-blue-50 opacity-60 pointer-events-none">
                     <Snowflake size={48} />
                </div>
            </>
        )}

        <div className="w-full h-full flex-1 flex flex-col z-10">
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
                 <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center animate-fade-in pb-20">
                    <div className="mb-6 animate-bounce">
                        <Trophy size={64} className="text-yellow-500 mx-auto drop-shadow-lg" fill="currentColor" />
                    </div>
                    <h2 className="text-5xl md:text-6xl font-christmas font-bold text-red-600 mb-2 drop-shadow-sm">Game Over!</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest mb-8">Final Standings</p>
                    
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl w-full max-w-md border-4 border-red-50 relative overflow-hidden">
                        {sortedTeams.map((team, idx) => (
                            <div key={team.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md border-2 border-white ${
                                        idx === 0 ? 'bg-yellow-400 scale-110 ring-2 ring-yellow-200' : 
                                        idx === 1 ? 'bg-gray-300' : 
                                        idx === 2 ? 'bg-amber-600' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        {idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                    </div>
                                    <div className="text-left">
                                        <span className={`block font-bold text-lg leading-tight ${idx === 0 ? 'text-gray-800 text-xl' : 'text-gray-600'}`}>{team.name}</span>
                                        {idx === 0 && <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Winner</span>}
                                    </div>
                                </div>
                                <span className={`text-3xl font-black font-christmas ${idx === 0 ? 'text-green-600' : 'text-gray-400'}`}>{team.score} pts</span>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={restartGame}
                        className="mt-10 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-transform hover:scale-105 border-b-4 border-red-800 flex items-center gap-2"
                    >
                        <RefreshCw size={20} /> Play Again
                    </button>
                 </div>
            )}
        </div>
      </main>

      {/* Exit Game Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border-4 border-red-100">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Exit Game?</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to quit? Current progress will be lost.</p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowExitConfirm(false)}
                        className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-700 hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmExit}
                        className="flex-1 py-3 rounded-xl bg-red-600 font-bold text-white hover:bg-red-700 shadow-lg"
                    >
                        Exit
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Footer - Hide if embedded */}
      {!isEmbedded && (
        <footer className="py-6 text-center text-red-800/40 text-sm font-christmas tracking-widest">
            <p>Merry Christmas & Happy New Year!</p>
        </footer>
      )}
    </div>
  );
};

export default App;