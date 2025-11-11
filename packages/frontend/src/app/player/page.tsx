export default function PlayerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-accent-orange via-accent-yellow to-accent-orange bg-pattern">
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="text-center mb-8 animate-float">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-2 drop-shadow-2xl">
            🎮 Player Mode 🎮
          </h1>
          <p className="text-xl md:text-2xl font-bold text-white/90 drop-shadow-lg">
            Join the fun or start your own game!
          </p>
        </div>

        {/* Main Card */}
        <div className="card-game max-w-md w-full border-8 border-white">
          <div className="space-y-6">
            {/* Create Room Button */}
            <button className="w-full btn-primary text-2xl py-6 group">
              <span className="flex items-center justify-center gap-3">
                <span className="text-3xl group-hover:scale-125 transition-transform">🎲</span>
                <span>Create New Room</span>
              </span>
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-4 border-gray-300 rounded"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-6 text-2xl font-black text-gray-500">OR</span>
              </div>
            </div>

            {/* Join Room Section */}
            <div className="space-y-4">
              <label className="block text-center">
                <span className="text-xl font-bold text-gray-700 mb-3 block">
                  Enter Game PIN:
                </span>
                <input
                  type="text"
                  placeholder="123456"
                  className="input-game text-center uppercase tracking-widest"
                  maxLength={6}
                />
              </label>

              <button className="w-full btn-secondary text-2xl py-6 group">
                <span className="flex items-center justify-center gap-3">
                  <span className="text-3xl group-hover:scale-125 transition-transform">🚀</span>
                  <span>Join Room</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Fun Instructions */}
        <div className="mt-8 max-w-md">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl">
            <h3 className="text-2xl font-black text-primary mb-3 text-center">
              How to Play:
            </h3>
            <ul className="space-y-2 text-lg font-semibold text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <span>Create a room or join with a PIN</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <span>Wait for players to join</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <span>Have fun and play together! 🎉</span>
              </li>
            </ul>
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
