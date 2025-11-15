import { Suspense } from 'react';
import BoardGame from './BoardGame';

function BoardGameWrapper() {
  return <BoardGame />;
}

export default function BoardPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-primary via-accent-blue to-primary-dark bg-pattern flex items-center justify-center p-4">
        <div className="bg-light-blue rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <p className="text-6xl mb-4">🔄</p>
          <p className="text-3xl font-bold text-primary">Loading...</p>
        </div>
      </main>
    }>
      <BoardGameWrapper />
    </Suspense>
  );
}
