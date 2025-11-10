export default function BoardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">Board View</h1>
          <p className="text-xl text-gray-600">Waiting for players to join...</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary mb-4">Room Code</p>
            <p className="text-6xl font-mono font-bold text-gray-800 tracking-wider">ABC123</p>
          </div>
          
          <div className="mt-8 border-t pt-8">
            <h2 className="text-2xl font-bold mb-4">Players</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-2"></div>
                <p className="font-semibold">Waiting...</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
                <p className="font-semibold">Waiting...</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
                <p className="font-semibold">Waiting...</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
                <p className="font-semibold">Waiting...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
