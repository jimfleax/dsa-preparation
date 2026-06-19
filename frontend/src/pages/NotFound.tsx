import { Map, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 font-sans text-center">
      <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-inner animate-bounce">
        <Map className="w-12 h-12" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight mb-3">
        404
      </h1>
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-4">
        Page Not Found
      </h2>
      <p className="text-sm sm:text-base text-neutral-500 font-medium max-w-md mb-8 leading-relaxed">
        Oops! The page you're looking for doesn't exist or has been moved. Let's
        get you back on track.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:bg-neutral-50 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Home className="w-4 h-4" />
          Go Home
        </button>
      </div>
    </div>
  );
}
