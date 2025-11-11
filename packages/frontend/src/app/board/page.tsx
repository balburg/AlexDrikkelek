export default function BoardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary via-accent-blue to-primary-dark bg-pattern">
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="text-center mb-8 animate-float">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-2 drop-shadow-2xl">
            🎪 Game Board 🎪
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-accent-yellow drop-shadow-lg animate-pulse">
            Waiting for players...
          </p>
        </div>

        {/* Main Game Card */}
        <div className="card-game max-w-5xl w-full border-8 border-white">
          {/* Room Code Section */}
          <div className="text-center mb-8 pb-8 border-b-4 border-gray-200">
            <p className="text-2xl font-bold text-gray-600 mb-3">
              🎯 Game PIN
            </p>
            <div className="bg-gradient-to-r from-accent-yellow via-accent-orange to-accent-yellow p-2 rounded-3xl inline-block">
              <p className="bg-white px-12 py-6 text-7xl font-black text-primary tracking-wider rounded-2xl shadow-inner">
                ABC123
              </p>
            </div>
            <p className="text-lg font-bold text-gray-500 mt-4">
              Share this PIN with your friends!
            </p>
          </div>

          {/* Players Grid */}
          <div>
            <h2 className="text-3xl font-black text-primary mb-6 text-center">
              👥 Players ({1}/10)
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Player 1 - Joined */}
              <div className="bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-game border-4 border-white">
                <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center shadow-inner">
                  <span className="text-4xl">🎮</span>
                </div>
                <p className="font-black text-white text-xl">Player 1</p>
                <p className="text-sm font-bold text-white/80 mt-1">Ready!</p>
              </div>

              {/* Waiting slots */}
              {[2, 3, 4].map((num) => (
                <div 
                  key={num}
                  className="bg-gray-100 rounded-2xl p-6 text-center border-4 border-dashed border-gray-300 opacity-60"
                >
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-4xl">👤</span>
                  </div>
                  <p className="font-bold text-gray-400 text-xl">Waiting...</p>
                  <p className="text-sm font-semibold text-gray-400 mt-1">Slot {num}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Start Game Button (would be enabled when enough players) */}
          <div className="mt-8 text-center">
            <button 
              disabled 
              className="px-12 py-6 bg-gray-300 text-gray-500 font-black text-3xl rounded-2xl cursor-not-allowed opacity-50"
            >
              Waiting for more players...
            </button>
            <p className="text-sm font-bold text-gray-500 mt-3">
              Need at least 2 players to start
            </p>
          </div>
        </div>

        {/* Fun Stats/Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl w-full">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 text-center shadow-xl border-4 border-accent-orange">
            <p className="text-4xl mb-2">🎲</p>
            <p className="text-2xl font-black text-primary">Ready to Roll!</p>
            <p className="text-sm font-bold text-gray-600 mt-1">The game is about to begin</p>
          </div>
          
          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 text-center shadow-xl border-4 border-accent-blue">
            <p className="text-4xl mb-2">⏱️</p>
            <p className="text-2xl font-black text-primary">Fast & Fun</p>
            <p className="text-sm font-bold text-gray-600 mt-1">Quick rounds, lots of laughs</p>
          </div>
          
          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 text-center shadow-xl border-4 border-accent-green">
            <p className="text-4xl mb-2">🏆</p>
            <p className="text-2xl font-black text-primary">Win Together</p>
            <p className="text-sm font-bold text-gray-600 mt-1">May the best player win!</p>
          </div>
        </div>

        {/* Back Button */}
        <a
          href="/"
          className="mt-8 text-white font-bold text-xl hover:text-accent-yellow transition-colors duration-300 hover:scale-110 transform inline-block"
        >
          ← Back to Home
        </a>
      </div>
    </main>
  );
}
