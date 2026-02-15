export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg animate-fade-in-up">
      {message}
    </div>
  );
}