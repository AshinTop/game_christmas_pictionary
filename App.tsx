import React, { useState, useMemo, useEffect } from 'react';
import { GameState, Team, ModalType } from './types';
import { GameLobby } from './components/GameLobby';
import Gameplay from './components/Gameplay';
import { Gift, Snowflake, RefreshCw, Trophy, Crown, LogOut, AlertCircle, Share2, Download, Mail, Facebook, Twitter, MessageCircle, Volume2, VolumeX, Link, Copy } from 'lucide-react';
// @ts-ignore
import html2canvas from 'html2canvas';
import { gameAudio } from './utils/audio';

// Extend Window interface for Google Analytics
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
    const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [teams, setTeams] = useState<Team[]>([]);
  const [gameWords, setGameWords] = useState<string[]>([]);
  const [roundsPerTeam, setRoundsPerTeam] = useState(6);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isMuted, setIsMuted] = useState(gameAudio.muted);

  useEffect(() => {
    // Initialize audio interaction on first click to satisfy browser policies
    const unlockAudio = () => {
        gameAudio.init();
        document.removeEventListener('click', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    return () => document.removeEventListener('click', unlockAudio);
  }, []);

  // Lock scroll when exit modal is open
  useEffect(() => {
    if (showExitConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showExitConfirm]);

  const toggleSound = () => {
      const newState = !isMuted;
      setIsMuted(newState);
      gameAudio.muted = newState;
      if (!newState) gameAudio.playClick();
  };

  // Detect if the app is running in an iframe
  const isEmbedded = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }, []);

  // Use simplified header if embedded OR if the game is in progress
  const showSimpleHeader = isEmbedded || gameState !== GameState.LOBBY || activeModal === 'start_confirmation';

  const handleStartGame = (gameTeams: Team[], customWords: string[], rounds: number) => {
    setTeams(gameTeams);
    setGameWords(customWords);
    setRoundsPerTeam(rounds);
    setGameState(GameState.TURN_START);
    gameAudio.playStart();
    
    // Track Game Start
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'start_game', {
        'event_category': 'game',
        'event_label': 'Christmas Pictionary',
        'team_count': gameTeams.length,
        'word_count': customWords.length,
        'rounds': rounds
      });
    }
  };

  const handleGameEnd = (finalTeams: Team[]) => {
    setTeams(finalTeams);
    setGameState(GameState.GAME_OVER);
    gameAudio.playWin();

    // Track Game End
    if (typeof window.gtag === 'function') {
      const winner = finalTeams.reduce((prev, current) => (prev.score > current.score) ? prev : current);
      window.gtag('event', 'game_over', {
        'event_category': 'game',
        'event_label': 'Christmas Pictionary',
        'winner_score': winner.score,
        'total_rounds': finalTeams.reduce((acc, t) => acc + t.score, 0) // Approximation of rounds/activity
      });
    }
  };

  const handleScoreUpdate = (teamId: number) => {
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.id === teamId ? { ...team, score: team.score + 1 } : team
      )
    );
  };

  const restartGame = () => {
    gameAudio.playClick();
    setGameState(GameState.LOBBY);
    setTeams([]);
  };

  const handleExitRequest = () => {
    gameAudio.playClick();
    if (gameState === GameState.LOBBY) {
        // Force refresh if in lobby to clear all state
        window.location.reload();
    } else {
        setShowExitConfirm(true);
    }
  };

  const confirmExit = () => {
      gameAudio.playClick();
      setGameState(GameState.LOBBY);
      setShowExitConfirm(false);
  };
  
  const handleScreenshot = async () => {
    gameAudio.playClick();
    const element = document.getElementById("game-over-card");
    if (!element) return;
    // Save scroll position
    const scrollPos = window.scrollY;
    // Scroll to top to ensure html2canvas captures correctly without offsets
    window.scrollTo(0, 0);
    try {
      // Small delay to ensure layout stabilizes after scroll
      await new Promise((resolve) => setTimeout(resolve, 100));
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const data = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = data;
      link.download = "christmas-pictionary-results.png";
      link.click();
    } catch (e) {
      console.error("Screenshot failed", e);
      alert("Could not create screenshot. Please try again.");
    } finally {
      // Restore scroll position
      window.scrollTo(0, scrollPos);
    }
  };


  const handleGlobalShare = async () => {
    gameAudio.playClick();
    const shareData = {
      title: 'Christmas Pictionary',
      text: 'Come play Christmas Pictionary with us! 🎄✨',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Share canceled
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        // Fallback
      }
    }
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'whatsapp' | 'copy') => {
      gameAudio.playClick();
      const text = `We just played Christmas Pictionary! 🎄 Winner: ${sortedTeams[0].name} with ${sortedTeams[0].score} points!`;
      const url = encodeURIComponent(window.location.href);
      const encodedText = encodeURIComponent(text);

      if (platform === 'copy') {
          navigator.clipboard.writeText(window.location.href);
          alert("Link copied to clipboard! You can paste it in Discord or WeChat.");
          return;
      }

      let shareUrl = '';
      if (platform === 'twitter') {
          shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`;
      } else if (platform === 'facebook') {
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      } else if (platform === 'whatsapp') {
          shareUrl = `https://wa.me/?text=${encodedText}%20${url}`;
      }
      
      window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Sort teams for leaderboard display
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => b.score - a.score);
  }, [teams]);

  return (
    <div className={`min-h-screen ${isEmbedded ? 'bg-white' : ''} flex flex-col font-sans text-gray-800 overflow-x-hidden transition-colors duration-500`}>
      
      {/* Header Logic */}
      {!showSimpleHeader ? (
        // Full Header (Only for Non-Embedded LOBBY)
        <header className="bg-white/90 backdrop-blur-md shadow-lg border-b-4 border-red-500 sticky top-0 z-50 transition-all duration-300">
          <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group select-none" onClick={() => setGameState(GameState.LOBBY)}>
               <div className="bg-gradient-to-br from-red-500 to-red-700 text-white p-2.5 rounded-xl transform -rotate-6 shadow-lg group-hover:rotate-0 transition-transform duration-300 hidden sm:block border-2 border-white ring-2 ring-red-200">
                  <Gift size={28} />
               </div>
               <div className="flex flex-col">
                   <h1 className="text-2xl md:text-3xl font-black font-christmas text-red-600 tracking-tight whitespace-nowrap leading-none drop-shadow-sm">
                     Christmas <span className="text-green-600">Pictionary</span>
                   </h1>
                   <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 pl-1 hidden sm:block">Family Party Game</span>
               </div>
            </div>

            <div className="flex items-center">
                {/* Scoreboard in Full Header is only shown if not in lobby, but simplified header logic takes over then. So this is mostly for potential future use or edge cases */}
                {gameState !== GameState.LOBBY && (
                <div className="flex items-center gap-3 md:gap-6 overflow-x-auto no-scrollbar px-4 border-r-2 border-gray-100 mr-4">
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
                
                <button 
                    onClick={toggleSound}
                    className={`p-2 rounded-full transition-colors ${isMuted ? 'text-gray-400 hover:text-gray-600' : 'text-green-600 hover:text-green-700 bg-green-50'}`}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
            </div>
          </div>
        </header>
      ) : (
        // Simplified Header (For Embedded OR Gameplay)
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
           
           <div className="flex items-center gap-2">
             <button 
                onClick={toggleSound}
                className={`p-1 transition-colors ${isMuted ? 'text-gray-300' : 'text-green-500'}`}
             >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
             </button>
             <button 
                 onClick={handleExitRequest} 
                 className={`p-1 transition-colors ${gameState === GameState.LOBBY ? 'text-gray-400 hover:text-red-500' : 'text-red-400 hover:text-red-600'}`} 
                 title={gameState === GameState.LOBBY ? "Reset" : "Exit Game"}
             >
                 {gameState === GameState.LOBBY ? <RefreshCw size={16} /> : <LogOut size={16} />}
             </button>
           </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 flex flex-col relative w-full ${isEmbedded ? 'p-0' : ''}`}>
        
        <div className="w-full h-full flex-1 flex flex-col z-10">
            {gameState === GameState.LOBBY && (
                <GameLobby onStartGame={handleStartGame} />
            )}
            
            {(gameState === GameState.TURN_START || gameState === GameState.DRAWING || gameState === GameState.SCORING) && (
                <Gameplay 
                  teams={teams} 
                  words={gameWords}
                  roundsPerTeam={roundsPerTeam}
                  onGameEnd={handleGameEnd} 
                  onScoreUpdate={handleScoreUpdate}
                />
            )}
            
            {gameState === GameState.GAME_OVER && (
                 <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center animate-fade-in pb-20">
                    <div className="mb-6 animate-bounce">
                        <Trophy size={80} className="text-yellow-500 mx-auto drop-shadow-xl" fill="currentColor" />
                    </div>
                    <h2 className="text-5xl md:text-7xl font-christmas font-bold text-red-600 mb-2 drop-shadow-md">Game Over!</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest mb-8">Final Standings</p>
                    
                   <div id="game-over-card" className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md border-8 border-red-500 relative overflow-hidden mb-6 bg-candy-cane">
                      <div className="absolute inset-2 bg-white rounded-2xl z-0"></div>
                      
                      <div className="relative z-10">
                          
                          {/* 1. 标题 (保持 SVG <text>) */}
                          <div className="text-center mb-6">
                              <svg width="100%" height="40" viewBox="0 0 300 40" className="mx-auto" xmlns="http://www.w3.org/2000/svg">
                                  <text 
                                      x="150" 
                                      y="30" 
                                      textAnchor="middle" 
                                      className="font-christmas" 
                                      style={{
                                          fontSize: '30px', 
                                          fontWeight: 'bold', 
                                          fill: '#B91C1C' /* text-red-700 */
                                      }}
                                  >
                                      Christmas Champions
                                  </text>
                              </svg>
                          </div>
                          
                          {sortedTeams.map((team, idx) => (
                              // 外部容器保持 Flexbox 布局
                              <div key={team.id} className="flex items-center justify-between py-4 border-b-2 border-gray-100 last:border-0 relative">
                                  
                                  {/* 2. 团队信息：奖杯/名称/Winner 标签 -> 统一 SVG 容器 */}
                                  <svg width="200" height="40" viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
                                      
                                      {/* A. 奖杯/序号容器（ w-14 h-14 圆圈） */}
                                      <g transform="translate(20, 20)"> {/* 将整个图标组定位在 (20, 20) */}
                                          <circle 
                                              r="20" /* w-14/2 约 28px/2 = 14，这里取 20px */
                                              cx="0" 
                                              cy="0" 
                                              fill={
                                                  idx === 0 ? '#FDD835' /* bg-yellow-400 */ : 
                                                  idx === 1 ? '#D1D5DB' /* bg-gray-300 */ : 
                                                  idx === 2 ? '#E98000' /* bg-amber-600 */ : '#F3F4F6' /* bg-gray-100 */
                                              }
                                              stroke="white" 
                                              strokeWidth="4" 
                                              // scale-110 (1.1) 仅应用于第一个元素
                                              transform={idx === 0 ? 'scale(1.1)' : 'scale(1)'}
                                          />
                                          {/* 奖杯/序号文本/Emoji */}
                                          <text 
                                              x="0" 
                                              y={idx >= 3 ? 4:8} /* 调整 Y 确保 Emoji 垂直居中 */
                                              textAnchor="middle" 
                                              fontSize={idx >= 3 ?16:24}
                                              fontWeight="bold"
                                              fill={idx >= 3 ? '#9CA3AF' : 'white'}
                                          >
                                              {idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                          </text>
                                      </g>

                                      {/* B. 团队名称 (Name) */}
                                      <text 
                                          x="55" /* 20 + 20(半径) + 15(间距) = 55 */
                                          y="18" /* 调整 Y 确保名称居中 */
                                          fontSize={idx === 0 ? '20' : '16'} 
                                          fontWeight="bold"
                                          fill={idx === 0 ? '#1F2937' /* text-gray-800 */ : '#4B5563' /* text-gray-600 */}
                                      >
                                          {team.name}
                                      </text>

                                      {/* C. Winner 标签 (仅第一个) */}
                                      {idx === 0 && (
                                          <rect 
                                              x="55" 
                                              y="25" /* 位于名称下方 */
                                              rx="10" /* rounded-full */ 
                                              width="55" 
                                              height="15" 
                                              fill="#F59E0B" /* bg-yellow-500 */
                                          />
                                      )}
                                      {idx === 0 && (
                                          <text 
                                              x="82.5" /* 55 + 55/2 = 82.5 (矩形中心) */
                                              y="36" 
                                              textAnchor="middle" 
                                              fontSize="10" /* text-[10px] */
                                              fontWeight="bold"
                                              fill="white"
                                          >
                                              WINNER
                                          </text>
                                      )}
                                  </svg>

                                  {/* 3. 分数 (保持 SVG <text>) */}
                                  <svg width="60" height="40" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
                                      <text 
                                          x="60" 
                                          y="30" 
                                          textAnchor="end" 
                                          className="font-christmas" 
                                          style={{
                                              fontSize: '40px', 
                                              fontWeight: '900', 
                                              fill: idx === 0 ? '#059669' : '#9CA3AF'
                                          }}
                                      >
                                          {team.score}
                                      </text>
                                  </svg>

                              </div>
                          ))}
                      </div>
                  </div>
                    
                    <div className="flex flex-col items-center gap-4 w-full max-w-md">
                        {/* Social Links Row */}
                        <div className="flex gap-3 justify-center w-full mb-2">
                             <button onClick={() => handleSocialShare('facebook')} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-transform hover:scale-105 shadow-md" title="Share on Facebook">
                                <Facebook size={20} />
                             </button>
                             <button onClick={() => handleSocialShare('twitter')} className="p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-transform hover:scale-105 shadow-md" title="Share on X (Twitter)">
                                <Twitter size={20} />
                             </button>
                             <button onClick={() => handleSocialShare('whatsapp')} className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-transform hover:scale-105 shadow-md" title="Share on WhatsApp">
                                <MessageCircle size={20} />
                             </button>
                             <button onClick={() => handleSocialShare('copy')} className="p-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-transform hover:scale-105 shadow-md flex items-center gap-2 font-bold text-sm" title="Copy Link (WeChat/Discord)">
                                <Link size={20} /> <span className="hidden sm:inline">Copy Link</span>
                             </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <button 
                                onClick={handleScreenshot}
                                className="btn-3d flex items-center justify-center gap-2 py-4 px-4 bg-white border-b-4 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 active:border-b-0 active:mt-1 active:mb-0"
                            >
                                <Download size={20} /> Save Image
                            </button>
                            <button 
                                onClick={handleGlobalShare}
                                className="btn-3d flex items-center justify-center gap-2 py-4 px-4 bg-blue-500 border-b-4 border-blue-700 text-white rounded-xl font-bold hover:bg-blue-600 active:border-b-0 active:mt-1 active:mb-0"
                            >
                                <Share2 size={20} /> Native Share
                            </button>
                        </div>

                        <button 
                            onClick={restartGame}
                            className="btn-3d w-full mt-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-5 px-10 rounded-full shadow-xl border-b-4 border-red-800 flex items-center justify-center gap-3 text-xl hover:from-red-600 hover:to-red-700 active:border-b-0 active:mt-1 active:mb-3"
                        >
                            <RefreshCw size={24} /> Play Again
                        </button>
                    </div>
                 </div>
            )}
        </div>
      </main>

      {/* Exit Game Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border-4 border-red-100 ring-4 ring-white">
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
        <footer className="py-8 flex flex-col items-center gap-4 text-red-900/60 text-sm font-christmas tracking-widest relative z-10">
            <p className="text-lg font-bold">Merry Christmas & Happy New Year!</p>
            <div className="flex gap-6">
                <button onClick={handleGlobalShare} className="flex items-center gap-2 hover:text-red-700 transition-colors">
                    <Share2 size={16} /> Share Game
                </button>
                <a href="mailto:support@crazy3d.org" className="flex items-center gap-2 hover:text-red-700 transition-colors">
                    <Mail size={16} /> Contact
                </a>
            </div>
        </footer>
      )}
    </div>
  );
};

export default App;