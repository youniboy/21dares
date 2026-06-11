'use client';

interface Props {
  dare: string;
  loserName: string;
  isLoser: boolean;
  onDone: () => void;
}

export default function DareCard({ dare, loserName, isLoser, onDone }: Props) {
  return (
    <div className="flex flex-col min-h-svh px-4 py-8 items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Card */}
        <div
          className="rounded-3xl p-6 border"
          style={{
            background: 'linear-gradient(135deg, #7f1d1d20, #DC262630)',
            borderColor: '#DC262650',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="px-3 py-1 rounded-full text-xs font-bold tracking-wider"
              style={{ background: '#DC2626', color: 'white' }}
            >
              DARE
            </div>
            <span className="text-xl">🔥</span>
          </div>
          <p className="text-white text-xl font-semibold leading-snug">
            {dare}
          </p>
        </div>

        <p className="text-center text-white/50 text-sm">
          {isLoser
            ? "Do it. The group is watching — no backing out 😤"
            : `${loserName} has to do this.`}
        </p>

        <button
          onClick={onDone}
          className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
          style={{ background: '#DC2626' }}
        >
          Next Round
        </button>
      </div>
    </div>
  );
}
