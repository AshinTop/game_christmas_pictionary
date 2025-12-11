import React, { useState, useEffect, useRef } from 'react';
import { GameState, Team, TurnResult } from '../types';
import CanvasBoard, { CanvasBoardRef } from './CanvasBoard';
import { Eye, Clock, CheckCircle, XCircle, ThumbsUp, X, Gift, EyeOff, Flag, Trophy, AlertCircle } from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface GameplayProps {
  teams: Team[];
  words: string[];
  roundsPerTeam: number;
  onGameEnd: (teams: Team[]) => void;
  onScoreUpdate: (teamId: number) => void;
}

const Gameplay: React.FC<GameplayProps> = ({ teams, words, roundsPerTeam, onGameEnd, onScoreUpdate }) => {
  // Game State
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>(GameState.TURN_START);
  const [currentWord, setCurrentWord] = useState<string>("");
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(60);
  const [turnResult, setTurnResult] = useState<TurnResult | null>(null);
  
  // Track total turns to enforce round limit
  const [totalTurnsPlayed, setTotalTurnsPlayed] = useState(0);
  
  // Flow control
  const [isWordRevealed, setIsWordRevealed] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);
  
  const canvasRef = useRef<CanvasBoardRef>(null);
  
  const currentTeam = teams[currentTeamIndex];

  // Helper to get random unique word
  const getNextWord = () => {
    // Use the passed props.words instead of constant
    const available = words.filter(w => !usedWords.has(w));
    
    if (available.length === 0) {
      // Reset if all used
      setUsedWords(new Set());
      // Safety check if words array is empty (though Lobby prevents this)
      if (words.length === 0) return "Christmas Tree"; 
      return words[Math.floor(Math.random() * words.length)];
    }
    const word = available[Math.floor(Math.random() * available.length)];
    setUsedWords(prev => new Set(prev).add(word));
    return word;
  };

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameState === GameState.DRAWING && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 11 && prev > 1) { // 10, 9...
                 gameAudio.playTick();
            }
            return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && gameState === GameState.DRAWING) {
       // Time's up!
       handleGiveUp();
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  // Lock scroll when end game modal is open
  useEffect(() => {
    if (showEndGameConfirm) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showEndGameConfirm]);

  // Actions
  const startTurn = () => {
    setCurrentWord(getNextWord());
    setGameState(GameState.TURN_START);
    setIsWordRevealed(false);
    setIsPeeking(false);
    setTimeLeft(60);
    setTurnResult(null);
  };

  const revealWord = () => {
    gameAudio.playClick();
    setIsWordRevealed(true);
  };

  const confirmReadyToDraw = () => {
    gameAudio.playStart();
    setGameState(GameState.DRAWING);
  };

  const handleCorrectGuess = () => {
    gameAudio.playSuccess();
    onScoreUpdate(currentTeam.id);
    setTurnResult({
      word: currentWord,
      guessedCorrectly: true,
      teamId: currentTeam.id
    });
    setGameState(GameState.SCORING);
  };

  const handleGiveUp = () => {
    gameAudio.playFailure();
    setTurnResult({
      word: currentWord,
      guessedCorrectly: false,
      teamId: currentTeam.id
    });
    setGameState(GameState.SCORING);
  };

  const nextTurn = () => {
    gameAudio.playClick();
    if (canvasRef.current) {
        canvasRef.current.clearCanvas();
    }

    // Check if max rounds reached
    // Total allowed turns = number of teams * rounds per team
    const nextTurnCount = totalTurnsPlayed + 1;
    const maxTurns = teams.length * roundsPerTeam;

    if (nextTurnCount >= maxTurns) {
        onGameEnd(teams);
        return;
    }

    setTotalTurnsPlayed(nextTurnCount);
    setCurrentTeamIndex((prev) => (prev + 1) % teams.length);
    startTurn();
  };

  const confirmEndGame = () => {
    gameAudio.playClick();
    onGameEnd(teams);
  };
  
  const togglePeek = () => {
      gameAudio.playClick();
      setIsPeeking(!isPeeking);
  }

  useEffect(() => {
    if (!currentWord) {
        startTurn();
    }
  }, []);

  // -- RENDER: TURN START --
  if (gameState === GameState.TURN_START) {
    if (!isWordRevealed) {
        // Phase 1: Ready Screen
        const currentRound = Math.floor(totalTurnsPlayed / teams.length) + 1;
        
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center animate-fade-in relative">
            <div className="mb-8">
               <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Round {currentRound} of {roundsPerTeam}</div>
               <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full ${currentTeam.color} flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-xl mb-4 border-4 border-white ring-2 ring-gray-200`}>
                 {currentTeamIndex + 1}
               </div>
               <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 font-christmas">
                 {currentTeam.name}'s Turn
               </h2>
               <p className="text-gray-500 text-base md:text-lg">Are you ready to draw?</p>
            </div>
            
            <button 
              onClick={revealWord}
              className={`btn-3d px-8 py-5 md:px-10 md:py-6 rounded-2xl text-xl md:text-2xl font-bold text-white shadow-xl flex items-center gap-3 ${currentTeam.color} border-b-4 border-black/20`}
            >
              <Gift size={28} /> Reveal Secret Word
            </button>
            <p className="mt-6 text-xs md:text-sm text-red-500 font-bold uppercase tracking-wider mb-8 bg-white/80 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm">
               ⚠️ Ensure only the artist is looking!
            </p>

            <button 
                onClick={() => setShowEndGameConfirm(true)}
                className="text-gray-400 hover:text-red-500 font-bold text-sm flex items-center gap-2 mt-auto py-4 px-4 bg-white/50 rounded-xl hover:bg-white transition-colors"
            >
                <Flag size={16} /> End Game Early
            </button>

            {/* End Game Modal - Scoped here to allow ending during turn start */}
            {showEndGameConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border-4 border-red-100">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Finish the Game?</h3>
                        <p className="text-gray-600 mb-6">This will end the current session and show the final leaderboard.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowEndGameConfirm(false)}
                                className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-700 hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmEndGame}
                                className="flex-1 py-3 rounded-xl bg-red-600 font-bold text-white hover:bg-red-700 shadow-lg"
                            >
                                Finish
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </div>
        );
    } else {
        // Phase 2: View Word Screen
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center animate-fade-in">
            <h3 className="text-gray-500 uppercase tracking-widest font-bold text-xs md:text-sm mb-6 bg-white/50 px-3 py-1 rounded-full">Your Secret Word Is...</h3>
            
            <div className="mb-10 p-8 md:p-12 bg-white border-8 border-red-500 rounded-3xl w-full max-w-lg shadow-2xl bg-candy-cane relative overflow-hidden">
              <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center p-4">
                  <div className="text-4xl md:text-6xl font-black text-gray-800 font-christmas tracking-wide animate-pulse-slow break-words text-center leading-tight">
                    {currentWord}
                  </div>
              </div>
            </div>
  
            <button 
              onClick={confirmReadyToDraw}
              className="btn-3d w-full max-w-sm bg-green-500 text-white font-bold py-5 rounded-2xl text-lg md:text-xl shadow-lg flex items-center justify-center gap-2 border-b-4 border-green-700 active:border-b-0 active:mt-1 active:mb-[-1px]"
            >
              <Clock size={24} /> Start Timer & Draw
            </button>
          </div>
        );
    }
  }

  // -- RENDER: SCORING --
  if (gameState === GameState.SCORING && turnResult) {
    // Calculate if it's the last turn
    const currentTurnCount = totalTurnsPlayed; // Current turns before this one was completed, wait... 
    // totalTurnsPlayed updates in nextTurn, so currently it is N.
    // The next button will make it N+1.
    const isLastTurn = (totalTurnsPlayed + 1) >= (teams.length * roundsPerTeam);

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center animate-fade-in w-full">
         <div className="bg-white p-6 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full relative border-8 border-white ring-4 ring-gray-100">
            {turnResult.guessedCorrectly ? (
                <div className="mb-4">
                    <CheckCircle className="w-20 h-20 md:w-24 md:h-24 text-green-500 mx-auto mb-4 animate-bounce drop-shadow-md" />
                    <h2 className="text-4xl md:text-5xl font-christmas font-bold text-green-600 mb-2">Correct!</h2>
                    <p className="text-white text-lg md:text-xl font-bold bg-green-500 inline-block px-4 py-1 rounded-full shadow-sm">+1 Point</p>
                </div>
            ) : (
                <div className="mb-4">
                     <XCircle className="w-20 h-20 md:w-24 md:h-24 text-red-500 mx-auto mb-4 drop-shadow-md" />
                     <h2 className="text-4xl md:text-5xl font-christmas font-bold text-red-600 mb-2">Time's Up!</h2>
                     <p className="text-gray-400 text-base md:text-lg font-medium">Better luck next time!</p>
                </div>
            )}

            {/* Prominent Secret Word Display */}
            <div className="my-6 md:my-8 py-6 md:py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 relative">
                 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-3 text-gray-400 text-xs font-bold uppercase tracking-widest">The Secret Word Was</div>
                <div className="text-3xl md:text-5xl font-black font-christmas text-gray-800 tracking-wide break-words px-4">
                    {turnResult.word}
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-6 md:mt-8">
                <button 
                    onClick={nextTurn}
                    className="btn-3d w-full bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg text-lg flex items-center justify-center gap-2 border-b-4 border-blue-700 active:border-b-0 active:mt-1 active:mb-[-1px]"
                >
                    {isLastTurn ? "Finish Game" : "Next Team"} <PlayArrowIcon />
                </button>
                {!isLastTurn && (
                    <button 
                        onClick={() => setShowEndGameConfirm(true)}
                        className="w-full bg-transparent hover:bg-gray-50 text-gray-400 hover:text-red-500 font-bold py-3 rounded-xl text-sm transition-colors"
                    >
                        End Game Now
                    </button>
                )}
            </div>
         </div>
         {/* End Game Modal for Scoring Screen */}
         {showEndGameConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border-4 border-red-100">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Declare Winner?</h3>
                    <p className="text-gray-600 mb-6">Show the final leaderboard and end the game?</p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowEndGameConfirm(false)}
                            className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-700 hover:bg-gray-200"
                        >
                            Back
                        </button>
                        <button 
                            onClick={confirmEndGame}
                            className="flex-1 py-3 rounded-xl bg-red-600 font-bold text-white hover:bg-red-700 shadow-lg"
                        >
                            Show Ranking
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  }

  // -- RENDER: DRAWING BOARD --
  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full relative">
      {/* Top Bar - Mobile Optimized */}
      <div className="flex items-center justify-between px-3 py-2 md:p-4 bg-white/80 backdrop-blur rounded-b-2xl mb-2 md:mb-4 shadow-sm border-b border-gray-100 z-20">
        
        {/* Left: Artist Info */}
        <div className={`flex flex-col justify-center ${currentTeam.color.replace('bg-', 'text-')} pl-1`}>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-60">Artist</span>
            <span className="font-bold text-base md:text-lg leading-tight truncate max-w-[90px] md:max-w-[150px]">{currentTeam.name}</span>
        </div>

        {/* Center: Timer */}
        <div className={`absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center bg-white px-3 py-1 rounded-xl shadow-sm border border-gray-100 ${timeLeft < 11 ? 'animate-pulse border-red-200' : ''}`}>
             <div className={`flex items-center gap-1.5 font-mono text-xl md:text-3xl font-black ${timeLeft < 11 ? 'text-red-500' : 'text-gray-700'}`}>
                <Clock size={20} className={timeLeft < 11 ? 'animate-bounce' : ''} />
                {timeLeft}
            </div>
        </div>

        {/* Right: Target Word Peek */}
        <div className="flex flex-col items-end">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5 pr-1">Target</span>
            <div className="relative">
                <button 
                  onClick={togglePeek}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${isPeeking ? 'bg-gray-800 text-white border-gray-800' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                >
                    {isPeeking ? (
                        <>
                           <span className="max-w-[80px] md:max-w-none truncate">{currentWord}</span>
                           <EyeOff size={14} className="flex-shrink-0" />
                        </>
                    ) : (
                        <>
                           <span>Hidden</span>
                           <Eye size={14} />
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 px-2 md:px-4 flex flex-col items-center w-full z-10">
        <CanvasBoard ref={canvasRef} />
        
        {/* Action Buttons - Mobile Responsive */}
        <div className="w-full max-w-2xl mt-4 md:mt-6 flex gap-3 md:gap-4 px-2 md:px-0">
             <button
                onClick={handleGiveUp}
                className="btn-3d flex-1 bg-gray-100 text-gray-500 font-bold py-3 md:py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm md:text-base border-b-4 border-gray-300 hover:bg-gray-200 active:border-b-0 active:mt-1 active:mb-[-1px]"
            >
                <X size={18} /> <span className="hidden sm:inline">Give Up</span><span className="sm:hidden">Give Up</span>
            </button>
            <button
                onClick={handleCorrectGuess}
                className="btn-3d flex-[2] bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm md:text-lg border-b-4 border-green-800 active:border-b-0 active:mt-1 active:mb-[-1px]"
            >
                <ThumbsUp size={20} /> <span className="sm:inline">Correct!</span><span className="hidden">Got it!</span>
            </button>
        </div>
        
        <div className="flex flex-col items-center justify-between w-full max-w-2xl mt-6 pb-4">
             <button 
                onClick={() => setShowEndGameConfirm(true)}
                className="text-gray-300 hover:text-red-500 text-sm font-bold flex items-center gap-1 transition-colors px-4 py-2 hover:bg-white/50 rounded-lg"
                title="End Game Early"
            >
                <Flag size={12} /> End Game
            </button>
        </div>
      </div>

      {/* End Game Modal - Scoped here to allow ending during drawing */}
        {showEndGameConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border-4 border-red-100">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Stop the Game?</h3>
                    <p className="text-gray-600 mb-6">Are you sure you want to end the game and see the winners?</p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowEndGameConfirm(false)}
                            className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-700 hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmEndGame}
                            className="flex-1 py-3 rounded-xl bg-red-600 font-bold text-white hover:bg-red-700 shadow-lg"
                        >
                            End Game
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

// Simple arrow icon for the button
const PlayArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14"></path>
        <path d="m12 5 7 7-7 7"></path>
    </svg>
);

export default Gameplay;