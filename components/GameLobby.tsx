import React, { useState } from 'react';
import { Team } from '../types';
import { TEAM_COLORS } from '../constants';
import { Play, HelpCircle, X, Monitor, PenTool, Tv, Palette, Smile, CheckSquare, Square, Gift, Trees, Trophy, Clock } from 'lucide-react';

interface GameLobbyProps {
  onStartGame: (teams: Team[]) => void;
}

type ModalType = 'none' | 'help' | 'start_confirmation';

export const GameLobby: React.FC<GameLobbyProps> = ({ onStartGame }) => {
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'The Elves', score: 0, color: TEAM_COLORS[0].hex },
    { id: 2, name: 'The Reindeers', score: 0, color: TEAM_COLORS[1].hex }
  ]);
  
  // Modal state management
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const addTeam = () => {
    // Limit removed as per request
    const nextColorIdx = teams.length % TEAM_COLORS.length;
    setTeams([
      ...teams,
      { 
        id: Date.now(), 
        name: `Team ${teams.length + 1}`, 
        score: 0, 
        color: TEAM_COLORS[nextColorIdx].hex 
      }
    ]);
  };

  const removeTeam = (id: number) => {
    if (teams.length <= 2) return;
    setTeams(teams.filter(t => t.id !== id));
  };

  const updateName = (id: number, name: string) => {
    setTeams(teams.map(t => t.id === id ? { ...t, name } : t));
  };

  const handleStartRequest = () => {
    const skipIntro = localStorage.getItem('christmas_pictionary_skip_intro') === 'true';
    if (skipIntro) {
        onStartGame(teams);
    } else {
        setDontShowAgain(false);
        setActiveModal('start_confirmation');
    }
  };

  const confirmStartGame = () => {
    if (dontShowAgain) {
        localStorage.setItem('christmas_pictionary_skip_intro', 'true');
    }
    onStartGame(teams);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 animate-fade-in w-full max-w-5xl mx-auto relative">
        
        {/* Main Game Setup Card */}
        <div className="relative w-full max-w-lg mb-8 md:mb-12 z-10 group">
            {/* Candy Cane Border Effect */}
            <div className="absolute -inset-2 bg-[repeating-linear-gradient(45deg,#ef4444,#ef4444_20px,#ffffff_20px,#ffffff_40px)] rounded-3xl opacity-70 blur-sm group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl relative border-4 border-red-100">
              <button 
                  onClick={() => setActiveModal('help')}
                  className="absolute top-4 right-4 text-gray-400 hover:text-green-600 transition-colors p-1"
                  title="How to Play"
              >
                  <HelpCircle size={28} />
              </button>

              <div className="text-center mb-8">
                <div className="inline-block p-3 rounded-full bg-red-50 mb-3 border border-red-100">
                    <Gift size={32} className="text-red-600" />
                </div>
                <h2 className="font-christmas text-4xl md:text-5xl text-red-700 font-bold mb-2 tracking-wide">
                    Christmas Pictionary
                </h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Holiday Party Edition</p>
              </div>

              <div className="space-y-4 mb-8">
                {teams.map((team, index) => (
                  <div key={team.id} className="flex items-center gap-3 group/input">
                    <div className={`w-12 h-12 rounded-2xl ${team.color} flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 transform group-hover/input:rotate-6 transition-transform`}>
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) => updateName(team.id, e.target.value)}
                      className="flex-1 text-lg border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 outline-none transition-all w-full font-bold text-gray-700"
                      placeholder="Team Name"
                    />
                    {teams.length > 2 && (
                      <button 
                        onClick={() => removeTeam(team.id)}
                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mb-8">
                <button 
                  onClick={addTeam}
                  className="flex-1 py-4 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all text-base"
                >
                  + Add Team
                </button>
              </div>

              <button 
                onClick={handleStartRequest}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-xl font-bold py-5 rounded-xl shadow-xl transform transition hover:scale-[1.02] flex items-center justify-center gap-3 border-b-4 border-red-800"
              >
                <Play fill="currentColor" /> Start The Fun
              </button>
            </div>
        </div>

        {/* SEO & Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-sm border border-white/50 text-left relative overflow-hidden">
          {/* Decorative Background Icon */}
          <Trees className="absolute -bottom-10 -right-10 text-green-100 w-64 h-64 pointer-events-none -z-10" />

          {/* Left Column: Quick Guide */}
          <div className="relative z-10">
              <h3 className="text-2xl font-bold text-red-700 font-christmas mb-6 flex items-center gap-2">
                  <Tv size={28} className="text-red-600" /> How to Play
              </h3>
              <ul className="space-y-6">
                  <li className="flex gap-4 items-start">
                      <span className="bg-green-100 text-green-700 font-black rounded-xl w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm shadow-sm">1</span>
                      <div>
                          <strong className="block text-gray-800 text-lg mb-1">Connect to TV</strong>
                          <span className="text-gray-600 text-sm leading-relaxed">Cast this screen to a TV or use a large tablet so everyone can see the drawing board.</span>
                      </div>
                  </li>
                  <li className="flex gap-4 items-start">
                      <span className="bg-green-100 text-green-700 font-black rounded-xl w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm shadow-sm">2</span>
                      <div>
                          <strong className="block text-gray-800 text-lg mb-1">Form Teams</strong>
                          <span className="text-gray-600 text-sm leading-relaxed">Divide your group into 2-4 teams. Enter your fun team names above!</span>
                      </div>
                  </li>
                  <li className="flex gap-4 items-start">
                      <span className="bg-green-100 text-green-700 font-black rounded-xl w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm shadow-sm">3</span>
                      <div>
                          <strong className="block text-gray-800 text-lg mb-1">Draw & Guess</strong>
                          <span className="text-gray-600 text-sm leading-relaxed">Teams take turns. One artist draws a festive word while their team guesses against the clock.</span>
                      </div>
                  </li>
              </ul>
          </div>

          {/* Right Column: SEO Content */}
          <div className="relative z-10 border-l border-white/0 md:border-green-100 md:pl-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 font-christmas text-3xl text-green-700">
                  <Smile size={28} className="text-yellow-500" /> Perfect for Holidays
              </h3>
              <p className="text-gray-700 mb-6 text-base leading-relaxed">
                  The ultimate <strong>family Christmas game</strong>! Replaces messy paper and pens with a fun, interactive digital whiteboard. Great for iPads, tablets, or laptops.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white/80 p-3 rounded-xl border border-red-100 flex items-center gap-3 shadow-sm">
                      <div className="p-2 bg-red-100 rounded-lg text-red-600"><Palette size={20} /></div>
                      <div>
                          <h4 className="font-bold text-sm text-gray-800">Multi-Color Board</h4>
                          <p className="text-xs text-gray-500">Festive colors for your art</p>
                      </div>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-green-100 flex items-center gap-3 shadow-sm">
                      <div className="p-2 bg-green-100 rounded-lg text-green-600"><Trophy size={20} /></div>
                      <div>
                          <h4 className="font-bold text-sm text-gray-800">Automatic Scoring</h4>
                          <p className="text-xs text-gray-500">Track who's winning</p>
                      </div>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-blue-100 flex items-center gap-3 shadow-sm">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Clock size={20} /></div>
                      <div>
                          <h4 className="font-bold text-sm text-gray-800">60s Timer</h4>
                          <p className="text-xs text-gray-500">Keeps the game moving</p>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* Unified Rules/Start Modal */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-red-900/30 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative flex flex-col border-4 border-white ring-4 ring-red-100">
                <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 p-4 flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-full text-red-600"><HelpCircle size={24} /></div>
                        <h3 className="text-3xl font-bold text-red-700 font-christmas">
                            {activeModal === 'start_confirmation' ? "Ready to Play?" : "How to Play"}
                        </h3>
                    </div>
                    <button 
                        onClick={() => setActiveModal('none')}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-red-500"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto flex-1 bg-[radial-gradient(#f3f4f6_1px,transparent_1px)] [background-size:20px_20px]">
                    {/* Consistent 3 Steps */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm transform -rotate-3">
                            <Monitor size={28} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-800 mb-1">1. Connect to TV</h4>
                            <p className="text-gray-600">Connect this device to a TV so the whole room can see the drawings!</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-sm transform rotate-3">
                             <div className="font-bold text-2xl">A</div>
                        </div>
                         <div>
                            <h4 className="text-xl font-bold text-gray-800 mb-1">2. Form Teams</h4>
                            <p className="text-gray-600">Split into teams. Enter your team names on the home screen.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-sm transform -rotate-3">
                            <PenTool size={28} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-800 mb-1">3. Draw & Guess</h4>
                            <p className="text-gray-600">Artist sees the secret word and draws. Team guesses before the timer runs out!</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    {activeModal === 'start_confirmation' ? (
                        <div className="flex flex-col gap-4">
                             <label className="flex items-center justify-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800 select-none bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <button 
                                    onClick={() => setDontShowAgain(!dontShowAgain)}
                                    className="focus:outline-none transition-transform active:scale-90"
                                >
                                    {dontShowAgain ? (
                                        <CheckSquare className="text-green-600" size={24} />
                                    ) : (
                                        <Square className="text-gray-300" size={24} />
                                    )}
                                </button>
                                <span onClick={() => setDontShowAgain(!dontShowAgain)} className="font-bold text-sm">Don't show instructions next time</span>
                            </label>

                            <button 
                                onClick={confirmStartGame}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-transform hover:scale-[1.02] text-xl flex items-center justify-center gap-2 border-b-4 border-green-800"
                            >
                                Enter Game <Play fill="currentColor" size={20} />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setActiveModal('none')}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-8 rounded-xl transition-colors text-lg"
                        >
                            Got it!
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </>
  );
};