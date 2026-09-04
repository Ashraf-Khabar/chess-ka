import Link from "next/link";
import { Settings, User, Menu, BookOpen, Activity } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full bg-slate-900 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold tracking-wider flex items-center gap-2">
              <span className="text-emerald-400">♟️ Chess</span>
              <span>Pro Analyzer</span>
            </Link>
          </div>

          {/* Main Navigation Menu (Hidden on mobile) */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
              <Activity size={18} />
              <span>Analysis Board</span>
            </Link>
            <Link href="/catalog" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
              <BookOpen size={18} />
              <span>Openings Catalog</span>
            </Link>
          </div>

          {/* Right Side: Preferences & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 hover:bg-slate-800 rounded-full transition-colors" title="Preferences">
              <Settings size={20} />
            </button>
            <div className="h-6 w-px bg-slate-700 mx-2"></div> {/* Divider */}
            <button className="text-sm font-medium hover:text-emerald-400 transition-colors">
              Log in
            </button>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
              <User size={16} />
              Sign up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button className="p-2 hover:bg-slate-800 rounded-md">
              <Menu size={24} />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}