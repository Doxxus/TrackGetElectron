export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
      <div
        className="h-full bg-purple-500 dark:bg-purple-400 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}