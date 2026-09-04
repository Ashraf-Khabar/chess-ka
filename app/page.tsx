import InteractiveBoard from "../features/chessboard/components/InteractiveBoard";
import { UploadCloud, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">
      
      {/* Left Column: Board Area (takes up 2/3 space on large screens) */}
      <div className="xl:col-span-2 flex flex-col gap-4">
        {/* Top bar for board controls (Import PGN, Fetch Chess.com) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Enter Chess.com username" 
              className="px-3 py-2 border border-slate-300 rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition flex items-center gap-2">
              <Search size={16} />
              Fetch Games
            </button>
          </div>
          <button className="text-slate-600 hover:text-slate-900 font-medium text-sm flex items-center gap-2">
            <UploadCloud size={16} />
            Import PGN
          </button>
        </div>

        {/* The Interactive Board */}
        <div className="flex justify-center w-full">
          <InteractiveBoard />
        </div>
      </div>

      {/* Right Column: Analysis Engine Data (takes up 1/3 space) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-[600px]">
        <h2 className="text-lg font-bold text-slate-900 border-b pb-3 mb-4">
          Engine Analysis
        </h2>
        
        {/* Placeholder for evaluation bar and move list */}
        <div className="flex-grow flex flex-col items-center justify-center text-slate-400 space-y-4">
          <p className="text-center text-sm">
            Import a game or make a move to start Stockfish evaluation.
          </p>
          
          {/* Example of future move badges */}
          <div className="flex gap-2 opacity-50 mt-4">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">Best Move</span>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">Brilliant</span>
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">Blunder</span>
          </div>
        </div>
      </div>

    </div>
  );
}