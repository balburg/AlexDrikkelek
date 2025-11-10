export default function PlayerPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Player View</h1>
          <p className="text-gray-600">Join or create a game room</p>
        </div>
        
        <div className="space-y-4">
          <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-lg transition-colors">
            Create Room
          </button>
          
          <div className="text-center text-gray-500">or</div>
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter room code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={6}
            />
            <button className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-4 px-6 rounded-lg transition-colors">
              Join Room
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
