import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function TracksSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Overall Progress Skeleton */}
      <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="h-48 w-full md:w-[280px] shrink-0 flex items-center justify-center">
          <Skeleton circle width={160} height={160} />
        </div>
        <div className="flex-1 w-full text-center md:text-left flex flex-col items-center md:items-start">
          <Skeleton width={180} height={24} className="mb-2" />
          <Skeleton width="80%" height={16} className="mb-6" />

          <div className="flex flex-wrap gap-4 justify-center md:justify-start w-full">
            <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-xl flex items-center gap-4 w-full max-w-[280px]">
              <div className="flex-1">
                <Skeleton width={100} height={12} className="mb-2" />
                <Skeleton width={40} height={28} />
              </div>
              <div className="w-px h-8 bg-neutral-200 mx-2"></div>
              <div className="flex-1">
                <Skeleton width={100} height={12} className="mb-2" />
                <Skeleton width={40} height={28} />
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-xl flex items-center gap-4 w-full max-w-[280px]">
              <div className="flex-1">
                <Skeleton width={100} height={12} className="mb-2" />
                <Skeleton width={40} height={28} />
              </div>
              <div className="w-px h-8 bg-neutral-200 mx-2"></div>
              <div className="flex-1">
                <Skeleton width={100} height={12} className="mb-2" />
                <Skeleton width={40} height={28} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Track Cards Skeleton */}
      <div className="grid gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Skeleton width="40%" height={24} className="mb-3" />
                <Skeleton width="90%" height={16} />
                <Skeleton width="70%" height={16} className="mt-1" />
              </div>
              <Skeleton width={100} height={36} borderRadius={18} />
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <Skeleton width="100%" height={8} borderRadius={4} />
            </div>

            {/* Problem Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {Array.from({ length: 8 }).map((_, j) => (
                <Skeleton key={j} width={120} height={32} borderRadius={16} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
