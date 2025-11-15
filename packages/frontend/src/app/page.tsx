export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary via-accent-blue to-secondary bg-pattern overflow-hidden">
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        {/* Animated header */}
        <div className="text-center mb-12 animate-float">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-4 drop-shadow-2xl">
            AlexDrikkelek
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-white/90 drop-shadow-lg">
            🎲 Let&apos;s Play! 🎉
          </p>
        </div>

        {/* Game mode cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full px-4">
          {/* Player View Card */}
          <a
            href="/player"
            className="group card-game card-orange border-8 border-accent-orange hover:border-accent-yellow transition-all duration-300"
          >
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-accent-orange to-accent-yellow rounded-3xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                <span className="text-6xl">📱</span>
              </div>
              
              {/* Title */}
              <h2 className="text-4xl font-black text-primary group-hover:text-accent-orange transition-colors duration-300">
                Player View
              </h2>
              
              {/* Description */}
              <p className="text-lg font-semibold text-gray-600">
                Join or create a game on your phone or tablet!
              </p>
              
              {/* CTA Button */}
              <div className="pt-4">
                <span className="inline-block px-8 py-3 bg-accent-orange text-white font-bold text-xl rounded-full group-hover:bg-accent-yellow group-hover:scale-110 transition-all duration-300 shadow-game">
                  Let&apos;s Go! →
                </span>
              </div>
            </div>
          </a>

          {/* Board View Card */}
          <a
            href="/board"
            className="group card-game card-blue border-8 border-accent-blue hover:border-accent-green transition-all duration-300"
          >
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-accent-blue to-accent-green rounded-3xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                <span className="text-6xl">📺</span>
              </div>
              
              {/* Title */}
              <h2 className="text-4xl font-black text-primary group-hover:text-accent-blue transition-colors duration-300">
                Board View
              </h2>
              
              {/* Description */}
              <p className="text-lg font-semibold text-gray-600">
                Display the game board on your TV or big screen!
              </p>
              
              {/* CTA Button */}
              <div className="pt-4">
                <span className="inline-block px-8 py-3 bg-accent-blue text-white font-bold text-xl rounded-full group-hover:bg-accent-green group-hover:scale-110 transition-all duration-300 shadow-game">
                  Show Board! →
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Fun footer message */}
        <div className="mt-16 text-center">
          <p className="text-white text-xl font-bold drop-shadow-lg animate-pulse-slow">
            ✨ Get ready for an epic game night! ✨
          </p>
        </div>

        {/* Admin Link */}
        <div className="mt-8 text-center">
          <a
            href="/admin"
            className="inline-block text-white/80 text-sm font-semibold hover:text-white hover:underline transition-all"
          >
            🔧 Admin Settings
          </a>
        </div>
      </div>
    </main>
  )
}
