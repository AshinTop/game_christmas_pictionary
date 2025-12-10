export enum GameState {
  LOBBY = 'LOBBY',
  TURN_START = 'TURN_START', // Showing the word to the drawer
  DRAWING = 'DRAWING',       // Timer running, drawing active
  SCORING = 'SCORING',       // Showing result of the turn
  GAME_OVER = 'GAME_OVER'
}

export interface Team {
  id: number;
  name: string;
  score: number;
  color: string;
}

export interface TurnResult {
  word: string;
  guessedCorrectly: boolean;
  teamId: number;
}

export interface RoundConfig {
  totalRounds: number;
  drawTimeSeconds: number;
}