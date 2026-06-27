import { Skeleton } from "@/components/ui/skeleton";

const SidebarSkeleton = () => {
  const items = Array.from({ length: 4 });

  return (
    <div className="min-h-screen w-60 border-r border-slate-700/20 px-3 py-4">
      <div className="flex flex-col items-center gap-4">
        {items.map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center gap-2 px-3 py-3 rounded-md bg-muted-foreground/5"
          >
            <Skeleton className="h-6 w-6 rounded-md" />

            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarSkeleton;
