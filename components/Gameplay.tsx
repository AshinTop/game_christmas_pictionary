import React, { useState, useEffect, useRef } from 'react';
import { GameState, Team, TurnResult } from '../types.ts';
import { CHRISTMAS_WORDS } from '../constants.ts';
import CanvasBoard, { CanvasBoardRef } from './CanvasBoard.tsx';
import { Eye, Clock, CheckCircle, XCircle, ThumbsUp, X, Gift } from 'lucide-react';

interface GameplayProps {
  teams: Team[];
  onGameEnd: (teams: Team[]) => void;
  onScoreUpdate: (teamId: number) => void;
}

const Gameplay: React.FC<GameplayProps> = ({ teams, onGameEnd, onScoreUpdate }) => {
  // Game State
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>(GameState.TURN_START);
  const [currentWord, setCurrentWord] = useState<string>("");
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(60);
  const [turnResult, setTurnResult] = useState<TurnResult | null>(null);
  
  // New state for flow control
  const [isWordRevealed, setIsWordRevealed] = useState(false);
  
  const canvasRef = useRef<CanvasBoardRef>(null);
  
  const currentTeam = teams[currentTeamIndex];

  // Helper to get random unique word
  const getNextWord = () => {
    const available = CHRISTMAS_WORDS.filter(w => !usedWords.has(w));
    if (available.length === 0) {
      // Reset if all used
      setUsedWords(new Set());
      return CHRISTMAS_WORDS[Math.floor(Math.random() * CHRISTMAS_WORDS.length)];
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
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === GameState.DRAWING) {
       // Time's up!
       handleGiveUp();
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  // Actions
  const startTurn = () => {
    setCurrentWord(getNextWord());
    setGameState(GameState.TURN_START);
    setIsWordRevealed(false); // Reset reveal state
    setTimeLeft(60);
    setTurnResult(null);
  };

  const revealWord = () => {
    setIsWordRevealed(true);
  };

  const confirmReadyToDraw = () => {
    setGameState(GameState.DRAWING);
  };

  const handleCorrectGuess = () => {
    // Call parent to update score
    onScoreUpdate(currentTeam.id);

    setTurnResult({
      word: currentWord,
      guessedCorrectly: true,
      teamId: currentTeam.id
    });

    setGameState(GameState.SCORING);
  };

  const handleGiveUp = () => {
    setTurnResult({
      word: currentWord,
      guessedCorrectly: false,
      teamId: currentTeam.id
    });
    setGameState(GameState.SCORING);
  };

  const nextTurn = () => {
    if (canvasRef.current) {
        canvasRef.current.clearCanvas();
    }
    setCurrentTeamIndex((prev) => (prev + 1) % teams.length);
    startTurn();
  };

  // Initial load
  useEffect(() => {
    // Only fetch word if we haven't yet (to avoid double fetch on re-renders if strict mode)
    if (!currentWord) {
        startTurn();
    }
  }, []);

  // -- RENDER: TURN START --
  if (gameState === GameState.TURN_START) {
    if (!isWordRevealed) {
        // Phase 1: Ready Screen
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center animate-fade-in">
            <div className="mb-8">
               <div className={`w-24 h-24 mx-auto rounded-full ${currentTeam.color} flex items-center justify-center text-white text-4xl font-bold shadow-xl mb-4`}>
                 {currentTeamIndex + 1}
               </div>
               <h2 className="text-4xl font-bold text-gray-800 mb-2">
                 {currentTeam.name}'s Turn
               </h2>
               <p className="text-gray-500 text-lg">Are you ready to draw?</p>
            </div>
            
            <button 
              onClick={revealWord}
              className={`px-10 py-5 rounded-2xl text-2xl font-bold text-white shadow-xl transition-transform transform active:scale-95 flex items-center gap-3 ${currentTeam.color}`}
            >
              <Gift size={32} /> Reveal Secret Word
            </button>
            <p className="mt-6 text-sm text-red-400 font-bold uppercase tracking-wider">
               ⚠️ Ensure only the artist is looking!
            </p>
          </div>
        );
    } else {
        // Phase 2: View Word Screen
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center animate-fade-in">
            <h3 className="text-gray-500 uppercase tracking-widest font-bold text-sm mb-6">Your Secret Word Is...</h3>
            
            <div className="mb-10 p-8 bg-red-50 border-2 border-dashed border-red-200 rounded-3xl">
              <div className="text-5xl md:text-7xl font-black text-gray-800 font-christmas tracking-wide animate-pulse-slow">
                {currentWord}
              </div>
            </div>
  
            <button 
              onClick={confirmReadyToDraw}
              className="w-full max-w-sm bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-xl shadow-lg transition-transform transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Clock size={24} /> Start Timer & Draw
            </button>
          </div>
        );
    }
  }

  // -- RENDER: SCORING --
  if (gameState === GameState.SCORING && turnResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center animate-fade-in">
         <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full relative border-4 border-red-100">
            {turnResult.guessedCorrectly ? (
                <div className="mb-4">
                    <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4 animate-bounce" />
                    <h2 className="text-5xl font-christmas font-bold text-green-600 mb-2">Correct!</h2>
                    <p className="text-green-600 text-xl font-bold bg-green-50 inline-block px-4 py-1 rounded-full">+1 Point</p>
                </div>
            ) : (
                <div className="mb-4">
                     <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
                     <h2 className="text-5xl font-christmas font-bold text-red-600 mb-2">Time's Up!</h2>
                     <p className="text-gray-400 text-lg font-medium">Better luck next time!</p>
                </div>
            )}

            {/* Prominent Secret Word Display */}
            <div className="my-8 py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300">
                <p className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-4">The Secret Word Was</p>
                <div className="text-5xl md:text-6xl font-black font-christmas text-gray-800 tracking-wide break-words px-4">
                    {turnResult.word}
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <button 
                    onClick={nextTurn}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-105 text-lg flex items-center justify-center gap-2"
                >
                    Next Team <PlayArrowIcon />
                </button>
            </div>
         </div>
      </div>
    );
  }

  // -- RENDER: DRAWING BOARD --
  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur rounded-b-2xl mb-4 shadow-sm">
        <div className={`flex flex-col ${currentTeam.color.replace('bg-', 'text-')}`}>
            <span className="text-xs font-bold uppercase tracking-wider">Artist</span>
            <span className="font-bold text-lg leading-none">{currentTeam.name}</span>
        </div>

        <div className={`flex items-center gap-2 font-mono text-2xl font-bold ${timeLeft < 10 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
            <Clock size={24} />
            {timeLeft}s
        </div>

        <div className="flex flex-col items-end">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Target</span>
            <div className="group relative">
                <span className="font-bold text-lg leading-none filter blur-md hover:blur-none transition-all cursor-help select-none">
                    {currentWord}
                </span>
                <span className="absolute -top-6 right-0 text-[10px] bg-black text-white px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Hover to peek
                </span>
            </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 px-4 flex flex-col items-center">
        <CanvasBoard ref={canvasRef} />
        
        <div className="w-full max-w-2xl mt-6 flex gap-4">
             <button
                onClick={handleGiveUp}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
                <X size={20} /> Give Up / Time's Up
            </button>
            <button
                onClick={handleCorrectGuess}
                className="flex-[2] bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
                <ThumbsUp size={24} /> We Guessed It!
            </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">Click Green when your team guesses correctly!</p>
      </div>
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