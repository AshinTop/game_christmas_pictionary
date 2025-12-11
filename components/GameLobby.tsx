import React, { useState, useEffect } from 'react';
import { Team } from '../types';
import { TEAM_COLORS, CHRISTMAS_WORDS } from '../constants';
import { Play, HelpCircle, X, Monitor, PenTool, Tv, Palette, Smile, CheckSquare, Square, Gift, Trees, Trophy, Clock, Settings, Plus, Trash2, RotateCcw, Save, Facebook, Twitter, MessageCircle, Link, Copy, Share2, Star, Users, Zap } from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface GameLobbyProps {
  onStartGame: (teams: Team[], customWords: string[], roundsPerTeam: number) => void;
}

type ModalType = 'none' | 'help' | 'start_confirmation' | 'settings';

export const GameLobby: React.FC<GameLobbyProps> = ({ onStartGame }) => {
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'The Elves', score: 0, color: TEAM_COLORS[0].hex },
    { id: 2, name: 'The Reindeers', score: 0, color: TEAM_COLORS[1].hex }
  ]);
  
  // Custom Word List Management
  const [wordList, setWordList] = useState<string[]>([]);
  const [newWordInput, setNewWordInput] = useState('');
  
  // Game Settings
  const [roundsPerTeam, setRoundsPerTeam] = useState(6);
  
  // Modal state management
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Load words from local storage on mount
  useEffect(() => {
    const savedWords = localStorage.getItem('christmas_pictionary_custom_words');
    if (savedWords) {
        try {
            const parsed = JSON.parse(savedWords);
            if (Array.isArray(parsed) && parsed.length > 0) {
                setWordList(parsed);
                return;
            }
        } catch (e) {
            console.error("Failed to parse saved words", e);
        }
    }
    // Fallback to default
    setWordList([...CHRISTMAS_WORDS]);
  }, []);

  // Lock scroll when modal is open
  useEffect(() => {
    if (activeModal !== 'none') {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [activeModal]);

  const saveWordsToStorage = (words: string[]) => {
      localStorage.setItem('christmas_pictionary_custom_words', JSON.stringify(words));
      setWordList(words);
  };

  const handleAddWord = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (newWordInput.trim()) {
          gameAudio.playClick();
          const updated = [...wordList, newWordInput.trim()];
          saveWordsToStorage(updated);
          setNewWordInput('');
      }
  };

  const handleDeleteWord = (wordToDelete: string) => {
      gameAudio.playClick();
      const updated = wordList.filter(w => w !== wordToDelete);
      saveWordsToStorage(updated);
  };

  const handleResetWords = () => {
      gameAudio.playClick();
      if (confirm('Are you sure you want to reset to the original Christmas word list? Your custom words will be lost.')) {
          saveWordsToStorage([...CHRISTMAS_WORDS]);
      }
  };

  const addTeam = () => {
    gameAudio.playClick();
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
    gameAudio.playClick();
    if (teams.length <= 2) return;
    setTeams(teams.filter(t => t.id !== id));
  };

  const updateName = (id: number, name: string) => {
    setTeams(teams.map(t => t.id === id ? { ...t, name } : t));
  };

  const handleStartRequest = () => {
    gameAudio.playClick();
    if (wordList.length < 5) {
        alert("You need at least 5 words in your library to play!");
        setActiveModal('settings');
        return;
    }

    const skipIntro = localStorage.getItem('christmas_pictionary_skip_intro') === 'true';
    if (skipIntro) {
        onStartGame(teams, wordList, roundsPerTeam);
    } else {
        setDontShowAgain(false);
        setActiveModal('start_confirmation');
    }
  };

  const confirmStartGame = () => {
    if (dontShowAgain) {
        localStorage.setItem('christmas_pictionary_skip_intro', 'true');
    }
    onStartGame(teams, wordList, roundsPerTeam);
  };

  const openModal = (type: ModalType) => {
      gameAudio.playClick();
      setActiveModal(type);
  }

  const handleSocialShare = (platform: string) => {
      gameAudio.playClick();
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent("Play Christmas Pictionary with us! 🎄✨");
      
      if (platform === 'copy') {
          navigator.clipboard.writeText(window.location.href);
          alert("Link copied! Share it on WeChat or Discord.");
          return;
      }
      
      let shareUrl = '';
      if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      if (platform === 'whatsapp') shareUrl = `https://wa.me/?text=${text}%20${url}`;
      
      if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 animate-fade-in w-full max-w-5xl mx-auto relative">
        
        {/* Main Game Setup Card */}
        <div className="relative w-full max-w-lg mb-8 md:mb-12 z-10 group">
            {/* Candy Cane Border Effect */}
            <div className="absolute -inset-3 rounded-[2rem] bg-candy-cane opacity-80 blur-sm shadow-xl"></div>
            
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl relative border-8 border-white">
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                    onClick={() => openModal('settings')}
                    className="text-gray-300 hover:text-blue-500 transition-colors p-2 hover:bg-blue-50 rounded-full"
                    title="Game Settings"
                >
                    <Settings size={24} />
                </button>
                <button 
                    onClick={() => openModal('help')}
                    className="text-gray-300 hover:text-green-500 transition-colors p-2 hover:bg-green-50 rounded-full"
                    title="How to Play"
                >
                    <HelpCircle size={24} />
                </button>
              </div>

              <div className="text-center mb-8">
                <div className="inline-block p-4 rounded-full bg-red-50 mb-3 border-2 border-red-100 shadow-inner">
                    <Gift size={40} className="text-red-500" />
                </div>
                <h2 className="font-christmas text-5xl md:text-6xl text-red-600 font-bold mb-2 tracking-wide drop-shadow-sm">
                    Christmas Pictionary
                </h2>
                <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">Holiday Party Edition</p>
              </div>

              <div className="space-y-4 mb-8">
                {teams.map((team, index) => (
                  <div key={team.id} className="flex items-center gap-3 group/input">
                    <div className={`w-14 h-14 rounded-2xl ${team.color} flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 transform group-hover/input:rotate-3 transition-transform text-xl border-4 border-white ring-2 ring-gray-100`}>
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) => updateName(team.id, e.target.value)}
                      className="flex-1 text-lg border-2 border-gray-100 bg-gray-50 rounded-2xl px-5 py-3 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 outline-none transition-all w-full font-bold text-gray-700 placeholder-gray-300"
                      placeholder="Team Name"
                    />
                    {teams.length > 2 && (
                      <button 
                        onClick={() => removeTeam(team.id)}
                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
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
                  className="flex-1 py-4 px-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 font-bold hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all text-base flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Add Team
                </button>
              </div>

              <button 
                onClick={handleStartRequest}
                className="btn-3d w-full bg-gradient-to-r from-red-500 to-red-600 text-white text-2xl font-bold py-5 rounded-2xl shadow-xl border-b-4 border-red-800 flex items-center justify-center gap-3 active:border-b-0 active:mt-1 active:mb-[-1px]"
              >
                <Play fill="currentColor" size={24} /> Start The Fun
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

          {/* Right Column: Features, Intro & Sharing */}
          <div className="relative z-10 border-l border-white/0 md:border-green-100 md:pl-8 flex flex-col justify-between h-full gap-6">
              
              {/* Intro Text */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2 font-christmas text-3xl text-green-700">
                    <Smile size={28} className="text-yellow-500" /> Fun Family Christmas Games
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                    Looking for <strong>Christmas party games for large groups</strong>? You've found the best free online option! This festive twist on Pictionary is perfect for families, office parties, and virtual holiday gatherings.
                </p>
              </div>

              {/* Feature Cards (Restored) */}
              <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white/80 p-3 rounded-xl border border-red-100 flex items-center gap-3 shadow-sm transition-transform hover:scale-[1.02]">
                      <div className="p-2 bg-red-100 rounded-lg text-red-600"><Palette size={20} /></div>
                      <div>
                          <h4 className="font-bold text-sm text-gray-800">Multi-Color Board</h4>
                          <p className="text-xs text-gray-500">Festive colors for your art</p>
                      </div>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-green-100 flex items-center gap-3 shadow-sm transition-transform hover:scale-[1.02]">
                      <div className="p-2 bg-green-100 rounded-lg text-green-600"><Trophy size={20} /></div>
                      <div>
                          <h4 className="font-bold text-sm text-gray-800">Automatic Scoring</h4>
                          <p className="text-xs text-gray-500">Track who's winning</p>
                      </div>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-blue-100 flex items-center gap-3 shadow-sm transition-transform hover:scale-[1.02]">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Clock size={20} /></div>
                      <div>
                          <h4 className="font-bold text-sm text-gray-800">60s Timer</h4>
                          <p className="text-xs text-gray-500">Keeps the game moving</p>
                      </div>
                  </div>
              </div>

              
          </div>
        </div>

      

        {/* New Expanded SEO Content Section */}
        <div className="w-full mt-8 bg-white/80 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/50 text-left shadow-sm">
            <h2 className="text-3xl md:text-4xl font-christmas font-bold text-red-700 mb-8 text-center drop-shadow-sm">The Best Christmas Party Game Ideas for 2025</h2>
            
            <div className="grid md:grid-cols-3 gap-8 text-sm text-gray-700 leading-relaxed">
                <div className="bg-white/60 p-6 rounded-2xl border border-green-50 hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-lg text-green-700 mb-3 flex items-center gap-2">
                        <Users className="w-8 h-8 p-1.5 bg-green-100 rounded-full text-green-600" /> 
                        For Large Groups
                    </h4>
                    <p className="mb-4">
                        Planning <strong>Christmas party games for large groups</strong> can be tricky. Christmas Pictionary scales perfectly! Whether you have 4 people or 40, simply divide into teams (The Elves vs. The Reindeers) and cast this screen to a TV. It's the ultimate icebreaker that gets everyone shouting guesses and laughing at terrible drawings.
                    </p>
                </div>
                
                <div className="bg-white/60 p-6 rounded-2xl border border-blue-50 hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-lg text-blue-700 mb-3 flex items-center gap-2">
                        <Monitor className="w-8 h-8 p-1.5 bg-blue-100 rounded-full text-blue-600" /> 
                        Virtual & In-Person
                    </h4>
                    <p className="mb-4">
                        Hosting a Zoom holiday party? This works as a <strong>virtual Christmas game</strong> too! Share your screen, and let players draw from their own devices. It's hassle-free entertainment that bridges the gap between physical and digital fun. Perfect for remote teams and long-distance families gathering online.
                    </p>
                </div>
                
                <div className="bg-white/60 p-6 rounded-2xl border border-red-50 hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-lg text-red-700 mb-3 flex items-center gap-2">
                        <Zap className="w-8 h-8 p-1.5 bg-red-100 rounded-full text-red-600" /> 
                        No Setup Required
                    </h4>
                    <p className="mb-4">
                        Forget printing out cards or buying markers. Our <strong>digital Pictionary word generator</strong> comes packed with hundreds of holiday-themed words like "Rudolph", "Snowball Fight", and "Ugly Sweater". Just hit play, and let the <strong>family Christmas games</strong> begin! It's completely free and runs right in your browser.
                    </p>
                </div>
            </div>

                    {/* Share Section */}
              <div className="mt-8 bg-white/50 p-4 rounded-2xl border border-white">
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-1 justify-center">
                      <Share2 size={12} /> Share the Fun
                  </p>
                  <div className="flex gap-2 justify-between">
                      <button onClick={() => handleSocialShare('facebook')} className="p-2 flex-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex justify-center" title="Facebook">
                          <Facebook size={20} />
                      </button>
                      <button onClick={() => handleSocialShare('twitter')} className="p-2 flex-1 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex justify-center" title="X (Twitter)">
                          <Twitter size={20} />
                      </button>
                      <button onClick={() => handleSocialShare('whatsapp')} className="p-2 flex-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex justify-center" title="WhatsApp">
                          <MessageCircle size={20} />
                      </button>
                      <button onClick={() => handleSocialShare('copy')} className="p-2 flex-1 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors flex justify-center" title="Copy Link">
                          <Link size={20} />
                      </button>
                  </div>
              </div>

            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                 <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-2">Popular Categories Included</p>
                 <div className="flex flex-wrap justify-center gap-2">
                    {["Christmas Movies", "Winter Activities", "Holiday Food", "Decorations", "Carols", "Nativity"].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-gray-600 text-xs font-bold">{tag}</span>
                    ))}
                 </div>
            </div>
        </div>

      </div>



      {/* Unified Modal System */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-red-50/30 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col border-8 border-red-100 ring-4 ring-white">
                
                {/* Modal Header */}
                <div className="bg-white/95 backdrop-blur border-b border-gray-100 p-4 flex justify-between items-center z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${activeModal === 'settings' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                            {activeModal === 'settings' ? <Settings size={24} /> : <HelpCircle size={24} />}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 font-christmas">
                            {activeModal === 'start_confirmation' ? "Ready to Play?" : activeModal === 'settings' ? "Game Settings" : "How to Play"}
                        </h3>
                    </div>
                    <button 
                        onClick={() => setActiveModal('none')}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-red-500"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                {/* Modal Content - Scrollable Area */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-[radial-gradient(#f3f4f6_1px,transparent_1px)] [background-size:20px_20px]">
                    
                    {/* HELP CONTENT */}
                    {activeModal === 'help' && (
                         <div className="space-y-6 md:space-y-8">
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
                    )}

                    {/* SETTINGS CONTENT */}
                    {activeModal === 'settings' && (
                        <div className="flex flex-col h-full">
                            
                            {/* Round Settings */}
                            <div className="mb-8">
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Clock size={18} className="text-blue-500" /> Game Duration
                                </h4>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                    <label className="flex justify-between mb-2 font-bold text-gray-700">
                                        Questions per Team: <span className="text-blue-600">{roundsPerTeam}</span>
                                    </label>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="10" 
                                        value={roundsPerTeam} 
                                        onChange={(e) => setRoundsPerTeam(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1 font-bold">
                                        <span>1</span>
                                        <span>Short (3)</span>
                                        <span>Standard (6)</span>
                                        <span>Long (10)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-4 bg-yellow-50 p-3 rounded-xl border border-yellow-200 text-yellow-800 text-sm">
                                <Save size={16} />
                                <span>Word Library - Changes are saved automatically.</span>
                            </div>

                            {/* Add Word Form */}
                            <form onSubmit={handleAddWord} className="flex gap-2 mb-6 shrink-0">
                                <input 
                                    type="text" 
                                    value={newWordInput}
                                    onChange={(e) => setNewWordInput(e.target.value)}
                                    placeholder="Add a custom word..."
                                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none bg-white font-bold text-gray-700"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newWordInput.trim()}
                                    className="bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Plus size={24} />
                                </button>
                            </form>

                            {/* Stats & Reset */}
                            <div className="flex justify-between items-center mb-3 shrink-0">
                                <span className="font-bold text-gray-500 text-sm uppercase tracking-wide">{wordList.length} Words in Library</span>
                                <button 
                                    onClick={handleResetWords}
                                    className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                >
                                    <RotateCcw size={12} /> Reset to Defaults
                                </button>
                            </div>

                            {/* Word List */}
                            <div className="flex-1 overflow-y-auto min-h-[200px] border border-gray-200 rounded-xl bg-gray-50 p-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {wordList.map((word, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center group">
                                            <span className="font-bold text-gray-700 truncate mr-2">{word}</span>
                                            <button 
                                                onClick={() => handleDeleteWord(word)}
                                                className="text-gray-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                                title="Remove word"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {wordList.length === 0 && (
                                        <div className="col-span-full text-center py-8 text-gray-400 font-bold">
                                            No words found. Add some or reset to defaults!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CONFIRMATION CONTENT */}
                    {activeModal === 'start_confirmation' && (
                        <div className="space-y-6">
                            {/* Rules Summary */}
                              <div className="p-4 rounded-2xl border border-blue-100 mb-6">
                                <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    className="lucide lucide-circle-question-mark"
                                    aria-hidden="true"
                                >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                    <path d="M12 17h.01"></path>
                                </svg>
                                Quick Rules
                                </h4>
                                <div
                                className="mt-4 space-y-4 overflow-y-auto flex-1 bg-[radial-gradient(#f3f4f6_1px,transparent_1px)] [background-size:20px_20px]"
                                >
                                <div className="flex gap-4">
                                    <div
                                    className="flex-shrink-0 w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm transform -rotate-3"
                                    >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="28"
                                        height="28"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        className="lucide lucide-monitor"
                                        aria-hidden="true"
                                    >
                                        <rect width="20" height="14" x="2" y="3" rx="2"></rect>
                                        <line x1="8" x2="16" y1="21" y2="21"></line>
                                        <line x1="12" x2="12" y1="17" y2="21"></line>
                                    </svg>
                                    </div>
                                    <div>
                                    <h4 className="font-bold text-gray-800 mb-1">1. Connect to TV</h4>
                                    <p className="text-gray-600">
                                        Connect this device to a TV so the whole room can see the drawings!
                                    </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div
                                    className="flex-shrink-0 w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-sm transform rotate-3"
                                    >
                                    <div className="font-bold text-2xl">A</div>
                                    </div>
                                    <div>
                                    <h4 className="font-bold text-gray-800 mb-1">2. Form Teams</h4>
                                    <p className="text-gray-600">
                                        Split into teams. Enter your team names on the home screen.
                                    </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div
                                    className="flex-shrink-0 w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-sm transform -rotate-3"
                                    >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="28"
                                        height="28"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        className="lucide lucide-pen-tool"
                                        aria-hidden="true"
                                    >
                                        <path
                                        d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"
                                        ></path>
                                        <path
                                        d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18"
                                        ></path>
                                        <path d="m2.3 2.3 7.286 7.286"></path>
                                        <circle cx="11" cy="11" r="2"></circle>
                                    </svg>
                                    </div>
                                    <div>
                                    <h4 className="font-bold text-gray-800 mb-1">3. Draw &amp; Guess</h4>
                                    <p className="text-gray-600">
                                        Artist sees the secret word and draws. Team guesses before the timer
                                        runs out!
                                    </p>
                                    </div>
                                </div>
                                </div>
                            </div>

                            {/* Game Config & Settings */}
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Game Setup</p>
                                    <div className="flex gap-4 mb-1">
                                        <span className="font-bold text-gray-800 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            {teams.length} Teams
                                        </span>
                                        <span className="font-bold text-gray-800 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                            {wordList.length} Words
                                        </span>
                                    </div>
                                    <span className="font-bold text-gray-600 flex items-center gap-1 text-sm">
                                        <Clock size={12} /> {roundsPerTeam} Rounds per team
                                    </span>
                                </div>
                                <button 
                                    onClick={() => openModal('settings')}
                                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors border border-blue-100"
                                >
                                    <Settings size={16} /> Edit
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Modal Footer */}
                <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
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
                                className="btn-3d w-full bg-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg text-xl flex items-center justify-center gap-2 border-b-4 border-green-800 active:border-b-0 active:mt-1 active:mb-[-1px]"
                            >
                                Enter Game <Play fill="currentColor" size={20} />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setActiveModal('none')}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-8 rounded-xl transition-colors text-lg"
                        >
                            {activeModal === 'settings' ? 'Done' : 'Got it!'}
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </>
  );
};