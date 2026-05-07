import { Skeleton } from "@/components/ui/skeleton";

export function VendorCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white">
      {/* Banner */}
      <Skeleton className="h-24 w-full rounded-none" />
      <div className="px-4 pb-4">
        {/* Avatar */}
        <div className="-mt-6 mb-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
        {/* Name + badges */}
        <Skeleton className="h-5 w-3/5 mb-1.5" />
        <Skeleton className="h-3 w-2/5 mb-3" />
        {/* Stats row */}
        <div className="flex gap-3">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}
