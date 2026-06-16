import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function TrackerSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Stats Section Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Solved Card */}
        <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm flex flex-col justify-center items-center gap-4">
          <Skeleton circle width={64} height={64} />
          <div className="text-center w-full flex flex-col items-center">
            <Skeleton width={120} height={16} className="mb-2" />
            <Skeleton width={60} height={40} />
          </div>
        </div>

        {/* Difficulty Distribution Chart */}
        <div className="bg-white border border-neutral-100 p-4 rounded-2xl shadow-sm flex flex-col justify-center items-center h-48">
          <div className="flex gap-6 items-center w-full justify-center">
            <Skeleton circle width={100} height={100} />
            <div className="flex flex-col gap-3">
              <Skeleton width={80} height={12} />
              <Skeleton width={80} height={12} />
              <Skeleton width={80} height={12} />
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm flex flex-col justify-center items-center gap-4">
          <Skeleton width={100} height={16} className="mb-2" />
          <div className="flex flex-col gap-3 w-full max-w-[200px]">
            <Skeleton height={44} borderRadius={12} />
            <Skeleton height={44} borderRadius={12} />
          </div>
        </div>
      </div>

      {/* Controls Panel Skeleton */}
      <div className="bg-white border border-neutral-100 p-5 rounded-2xl shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1">
            <Skeleton height={44} borderRadius={12} />
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Skeleton width={100} height={32} borderRadius={8} />
            <Skeleton width={140} height={32} borderRadius={8} />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white border border-neutral-100 rounded-2xl shadow-2xs overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="px-5 py-3"><Skeleton width={80} height={14} /></th>
                <th className="px-5 py-3 text-center"><Skeleton width={60} height={14} inline /></th>
                <th className="px-5 py-3 text-center"><Skeleton width={60} height={14} inline /></th>
                <th className="px-5 py-3"><Skeleton width={80} height={14} /></th>
                <th className="px-5 py-3 text-center"><Skeleton width={60} height={14} inline /></th>
                <th className="px-5 py-3 text-center w-24"><Skeleton width={60} height={14} inline /></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-neutral-50">
                  <td className="px-5 py-4"><Skeleton width="70%" height={20} /></td>
                  <td className="px-5 py-4 text-center"><Skeleton width={60} height={20} borderRadius={10} inline /></td>
                  <td className="px-5 py-4 text-center"><Skeleton width={30} height={20} borderRadius={10} inline /></td>
                  <td className="px-5 py-4"><Skeleton width={100} height={16} /></td>
                  <td className="px-5 py-4 text-center"><Skeleton width={80} height={28} borderRadius={8} inline /></td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <Skeleton width={28} height={28} borderRadius={8} />
                      <Skeleton width={28} height={28} borderRadius={8} />
                      <Skeleton width={28} height={28} borderRadius={8} />
                      <Skeleton width={28} height={28} borderRadius={8} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col divide-y divide-neutral-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 bg-white flex flex-col gap-3">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <Skeleton width="90%" height={20} />
                </div>
                <Skeleton width={60} height={20} borderRadius={10} />
              </div>
              <div className="flex justify-between mt-1">
                <Skeleton width={80} height={16} />
                <Skeleton width={100} height={16} />
              </div>
              <div className="flex gap-2 pt-3 border-t border-neutral-50">
                <Skeleton className="flex-1" height={36} borderRadius={12} />
                <Skeleton width={36} height={36} borderRadius={12} />
                <Skeleton width={36} height={36} borderRadius={12} />
                <Skeleton width={36} height={36} borderRadius={12} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
