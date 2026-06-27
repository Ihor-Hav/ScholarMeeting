import { Skeleton } from "@/components/ui/skeleton";

const NavbarSkeleton = () => {
  return (
    <div className="flex justify-between px-4 py-2 border-b border-b-slate-700/10">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex gap-2 items-center mr-10">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
};

export default NavbarSkeleton;
