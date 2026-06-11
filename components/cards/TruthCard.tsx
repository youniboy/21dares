'use client';

interface Props {
  question: string;
  loserName: string;
  isLoser: boolean;
  onDone: () => void;
}

export default function TruthCard({ question, loserName, isLoser, onDone }: Props) {
  return (
    <div className="flex flex-col min-h-svh px-4 py-8 items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Card */}
        <div
          className="rounded-3xl p-6 border"
          style={{
            background: 'linear-gradient(135deg, #4c1d9520, #7C3AED30)',
            borderColor: '#7C3AED50',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="px-3 py-1 rounded-full text-xs font-bold tracking-wider"
              style={{ background: '#7C3AED', color: 'white' }}
            >
              TRUTH
            </div>
            <span className="text-xl">🤔</span>
          </div>
          <p className="text-white text-xl font-semibold leading-snug">
            {question}
          </p>
        </div>

        {/* Player context */}
        <p className="text-center text-white/50 text-sm">
          {isLoser
            ? 'Answer honestly — the group is watching 👀'
            : `${loserName} has to answer this.`}
        </p>

        {/* Done button */}
        <button
          onClick={onDone}
          className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
          style={{ background: '#7C3AED' }}
        >
          Next Round
        </button>
      </div>
    </div>
  );
}
