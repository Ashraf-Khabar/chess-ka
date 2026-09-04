"use client"; // Required in Next.js App Router for interactive components

import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function InteractiveBoard() {
  // Initialize the chess logic engine with the starting position
  const [game, setGame] = useState(new Chess());

  // Handle piece drag and drop events
  function onDrop(sourceSquare: string, targetSquare: string) {
    try {
      // Create a shallow copy to trigger React state re-render
      const gameCopy = new Chess(game.fen());

      // Attempt the move. 'promotion' is defaulted to queen for simplicity.
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      // If the move is illegal, chess.js returns null. Return false to snap the piece back.
      if (move === null) return false;

      // Update the component state with the new valid position
      setGame(gameCopy);
      return true;
    } catch (error) {
      return false; // Failsafe for invalid move errors
    }
  }

  // Reset the board to the initial position
  const handleReset = () => {
    setGame(new Chess());
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[600px] mx-auto p-4">
      {/* Chessboard Container */}
      <div className="w-full shadow-2xl rounded-md overflow-hidden bg-white">
        <Chessboard
          id="BasicBoard"
          position={game.fen()}
          onPieceDrop={onDrop}
          boardOrientation="white"
          customDarkSquareStyle={{ backgroundColor: "#779556" }}
          customLightSquareStyle={{ backgroundColor: "#ebecd0" }}
        />
      </div>

      {/* Controls */}
      <button
        onClick={handleReset}
        className="px-6 py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
      >
        Reset Position
      </button>
    </div>
  );
}