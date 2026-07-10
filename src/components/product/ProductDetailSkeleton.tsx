export function ProductDetailSkeleton() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8 h-3 w-56 animate-pulse bg-sand" />
      <div className="grid items-start gap-10 md:grid-cols-2 lg:gap-16">
        <div className="aspect-[3/4] w-full animate-pulse bg-sand" />
        <div className="space-y-6">
          <div className="h-4 w-24 animate-pulse bg-sand" />
          <div className="h-10 w-3/4 animate-pulse bg-sand" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse bg-sand" />
            <div className="h-4 w-2/3 animate-pulse bg-sand" />
          </div>
          <div className="h-9 w-40 animate-pulse bg-sand" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-11 w-12 animate-pulse bg-sand" />
            ))}
          </div>
          <div className="h-12 w-full animate-pulse bg-sand" />
        </div>
      </div>
    </div>
  );
}
