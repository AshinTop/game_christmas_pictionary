import React, { useState } from 'react';
import { Team } from '../types';
import { TEAM_COLORS } from '../constants';
import { Users, Play, HelpCircle, X, Monitor, PenTool, Trophy, Clock, Tv, Palette, Smile, CheckSquare, Square } from 'lucide-react';

interface GameLobbyProps {
  onStartGame: (teams: Team[]) => void;
}

type ModalType = 'none' | 'help' | 'start_confirmation';

const GameLobby: React.FC<GameLobbyProps> = ({ onStartGame }) => {
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'The Elves', score: 0, color: TEAM_COLORS[0].hex },
    { id: 2, name: 'The Reindeers', score: 0, color: TEAM_COLORS[1].hex }
  ]);
  
  // Modal state management
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const addTeam = () => {
    if (teams.length >= 4) return;
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

  // Logic to handle the "Start Game" button click
  const handleStartRequest = () => {
    const skipIntro = localStorage.getItem('christmas_pictionary_skip_intro') === 'true';
    
    if (skipIntro) {
        onStartGame(teams);
    } else {
        setDontShowAgain(false); // Reset checkbox
        setActiveModal('start_confirmation');
    }
  };

  // Logic to confirm starting the game from the modal
  const confirmStartGame = () => {
    if (dontShowAgain) {
        localStorage.setItem('christmas_pictionary_skip_intro', 'true');
    }
    onStartGame(teams);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 animate-fade-in w-full max-w-5xl mx-auto">
      {/* Main Game Setup Card */}
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full border-b-8 border-red-200 relative mb-12 z-10">
        <button 
            onClick={() => setActiveModal('help')}
            className="absolute top-4 right-4 text-gray-400 hover:text-green-600 transition-colors"
            title="How to Play"
        >
            <HelpCircle size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="font-christmas text-4xl text-red-700 font-bold mb-2">Christmas Pictionary</h2>
          <p className="text-gray-500">Classic Party Game Mode</p>
        </div>

        <div className="space-y-4 mb-8">
          {teams.map((team, index) => (
            <div key={team.id} className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${team.color} flex items-center justify-center text-white font-bold shadow-md`}>
                {index + 1}
              </div>
              <input
                type="text"
                value={team.name}
                onChange={(e) => updateName(team.id, e.target.value)}
                className="flex-1 text-lg border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                placeholder="Team Name"
              />
              {teams.length > 2 && (
                <button 
                  onClick={() => removeTeam(team.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
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
            disabled={teams.length >= 4}
            className="flex-1 py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all disabled:opacity-50"
          >
            + Add Team
          </button>
        </div>

        <button 
          onClick={handleStartRequest}
          className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-xl font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <Play fill="currentColor" /> Start Game
        </button>
      </div>

      {/* SEO & Info Section */}
      <div className="grid md:grid-cols-2 gap-8 w-full bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white/50 text-left">
        {/* Left Column: Quick Guide */}
        <div>
            <h3 className="text-2xl font-bold text-red-700 font-christmas mb-4 flex items-center gap-2">
                <Tv size={24} /> How to Play
            </h3>
            <ul className="space-y-4 text-gray-700">
                <li className="flex gap-3 items-start">
                    <span className="bg-green-100 text-green-700 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <span><strong>Connect to TV:</strong> For the best experience, cast this screen to a large TV so everyone can watch the drawing action.</span>
                </li>
                <li className="flex gap-3 items-start">
                    <span className="bg-green-100 text-green-700 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <span><strong>Form Teams:</strong> Split your group into teams. Enter your team names above to get started.</span>
                </li>
                <li className="flex gap-3 items-start">
                    <span className="bg-green-100 text-green-700 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <span><strong>Draw & Guess:</strong> Take turns drawing festive words while your team guesses before time runs out!</span>
                </li>
            </ul>
        </div>

        {/* Right Column: SEO Content */}
        <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Smile size={20} className="text-yellow-600" /> Perfect for Holidays
            </h3>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Looking for the best <strong>family Christmas games ideas</strong>? This digital Christmas Pictionary is the ultimate no-prep solution. 
                Designed as one of the top <strong>Christmas party games for large groups</strong>, it replaces messy paper and pens with a fun, interactive digital whiteboard.
            </p>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Whether you're hosting a cozy family night or a big holiday bash, this game brings everyone together. It works great on iPads, tablets, or laptops connected to the living room TV.
            </p>
            
            <div className="flex flex-wrap gap-2 mt-4">
                <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1">
                    <Palette size={12} /> Multi-Color Brush
                </span>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1">
                    <Trophy size={12} /> Score Tracking
                </span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1">
                    <Clock size={12} /> Auto Timer
                </span>
            </div>
        </div>
      </div>

      {/* Unified Rules/Start Modal */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative flex flex-col">
                <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 p-4 flex justify-between items-center z-10">
                    <h3 className="text-2xl font-bold text-red-700 font-christmas">
                        {activeModal === 'start_confirmation' ? "Ready to Play?" : "How to Play"}
                    </h3>
                    <button 
                        onClick={() => setActiveModal('none')}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 md:p-8 space-y-8 overflow-y-auto flex-1">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Monitor size={24} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-800 mb-1">1. Cast to TV</h4>
                            <p className="text-gray-600">
                                This is a party game! Connect your laptop or phone to a large TV so the whole group can see the drawings.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                            <Users size={24} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-800 mb-1">2. Form Teams</h4>
                            <p className="text-gray-600">
                                Divide your group into teams (e.g., The Elves vs. The Reindeers). Enter your team names in the lobby.
                            </p>
                        </div>
                    </div>

                     {/* Step 3 */}
                     <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                            <PenTool size={24} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-800 mb-1">3. Draw & Guess</h4>
                            <p className="text-gray-600">
                                One person from the team (the "Artist") comes up to the device. They will see a secret Christmas word. They must draw it without using letters or numbers!
                            </p>
                        </div>
                    </div>

                     {/* Step 4 */}
                     <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-800 mb-1">4. Beat the Timer</h4>
                            <p className="text-gray-600">
                                The team has <span className="font-bold text-red-500">60 seconds</span> to shout out the correct answer. If they guess it, click the "We Guessed It" button!
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    {activeModal === 'start_confirmation' ? (
                        <div className="flex flex-col gap-4">
                             <label className="flex items-center justify-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800 select-none">
                                <button 
                                    onClick={() => setDontShowAgain(!dontShowAgain)}
                                    className="focus:outline-none"
                                >
                                    {dontShowAgain ? (
                                        <CheckSquare className="text-green-600" size={24} />
                                    ) : (
                                        <Square className="text-gray-300" size={24} />
                                    )}
                                </button>
                                <span onClick={() => setDontShowAgain(!dontShowAgain)}>Don't show instructions next time</span>
                            </label>

                            <button 
                                onClick={confirmStartGame}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-transform hover:scale-[1.02] text-xl flex items-center justify-center gap-2"
                            >
                                Enter Game <Play fill="currentColor" size={20} />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setActiveModal('none')}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-xl transition-colors"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default GameLobby;