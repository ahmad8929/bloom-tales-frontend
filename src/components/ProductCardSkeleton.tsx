import { Skeleton } from '@/components/ui/skeleton';

/** Premium loading placeholder matching ProductCard proportions. */
export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <Skeleton className="h-4 w-3/4 rounded-none" />
      <Skeleton className="h-4 w-1/3 rounded-none" />
      <Skeleton className="h-9 w-full rounded-none" />
    </div>
  );
}
