'use client';

interface Props {
  situation: string;
  loserName: string;
  isLoser: boolean;
  onDone: () => void;
}

export default function SituationCard({ situation, loserName, isLoser, onDone }: Props) {
  return (
    <div className="flex flex-col min-h-svh px-4 py-8 items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Card */}
        <div
          className="rounded-3xl p-6 border"
          style={{
            background: 'linear-gradient(135deg, #05966920, #05966930)',
            borderColor: '#05966950',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="px-3 py-1 rounded-full text-xs font-bold tracking-wider"
              style={{ background: '#059669', color: 'white' }}
            >
              SITUATION
            </div>
            <span className="text-xl">🎭</span>
          </div>
          <p className="text-white text-xl font-semibold leading-snug">
            {situation}
          </p>
        </div>

        <div
          className="rounded-2xl px-4 py-3 border border-white/8"
          style={{ background: '#1a1a24' }}
        >
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">The challenge</p>
          <p className="text-white/70 text-sm">
            {isLoser
              ? "Describe exactly how you'd play this out. No skipping. Be specific."
              : `${loserName} has to explain how they'd handle this scenario.`}
          </p>
        </div>

        <button
          onClick={onDone}
          className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
          style={{ background: '#059669' }}
        >
          Next Round
        </button>
      </div>
    </div>
  );
}
