'use client';

interface VotingModalProps {
  challengingPlayerName: string;
  votesReceived: number;
  totalVoters: number;
  onVote: (vote: boolean) => void;
  hasVoted: boolean;
}

export default function VotingModal({
  challengingPlayerName,
  votesReceived,
  totalVoters,
  onVote,
  hasVoted,
}: VotingModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary mb-2">Vote Time!</h2>
          <p className="text-lg text-gray-700">
            Did <span className="font-bold text-primary">{challengingPlayerName}</span> complete the challenge?
          </p>
        </div>

        {!hasVoted ? (
          <div className="space-y-3">
            <button
              onClick={() => onVote(true)}
              className="w-full py-4 px-6 bg-accent-green text-white rounded-2xl font-bold text-xl hover:opacity-90 transition-opacity shadow-lg"
            >
              ✓ Yes
            </button>
            <button
              onClick={() => onVote(false)}
              className="w-full py-4 px-6 bg-red-500 text-white rounded-2xl font-bold text-xl hover:opacity-90 transition-opacity shadow-lg"
            >
              ✗ No
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-xl font-bold text-primary mb-2">Vote Submitted!</p>
            <p className="text-gray-600">
              Waiting for other players...
            </p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Votes received:</span>
            <span className="font-bold text-primary">
              {votesReceived} / {totalVoters}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(votesReceived / totalVoters) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
