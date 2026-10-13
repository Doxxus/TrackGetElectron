export type TrackStatus = "pending" | "downloading" | "done" | "error";

export interface Track {
  title: string;
  progress: number;
  status: TrackStatus;
}

export function TrackProgressPanel({ tracks }: { tracks: Track[] }) {
  return (
    <div className="backdrop-blur-xl bg-white/70 dark:bg-purple-900/60 shadow-2xl rounded-2xl p-6 w-full max-w-md border border-white/40 dark:border-purple-700/40 flex flex-col max-h-[85vh]">
      <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4">
        Progress ({tracks.filter((t) => t.status === "done").length}/{tracks.length})
      </h2>
      <div className="space-y-2 overflow-y-auto pr-1">
        {tracks.map((t, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 border border-purple-200 dark:border-purple-700"
          >
            <div
              className={`absolute inset-y-0 left-0 transition-all duration-300 ease-out ${
                t.status === "error" ? "bg-red-400/70" : "bg-purple-400/70 dark:bg-purple-500/70"
              }`}
              style={{ width: `${t.status === "done" ? 100 : t.progress}%` }}
            />
            <div className="relative px-3 py-2 text-sm text-gray-900 dark:text-gray-100 truncate" title={t.title}>
              {t.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
