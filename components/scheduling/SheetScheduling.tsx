"use client";

import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetContent,
} from "@/components/ui/sheet";
import dynamic from "next/dynamic";
import type { schedulingWithId } from "@/schemas/scheduling.shared";
import type { SchedulingOrganizationOption } from "@/components/scheduling/fields/OrganizationRulesField";

const SchedulingForm = dynamic(() =>
  import("./forms/SchedulingForm").then((mod) => mod.SchedulingForm),
  {
    loading: () => (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        Loading scheduling form...
      </div>
    ),
  },
);

const SchedulingUpdateForm = dynamic(() =>
  import("@/components/scheduling/forms/SchedulingUpdateForm").then(
    (mod) => mod.SchedulingUpdateForm,
  ),
  {
    loading: () => (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        Loading scheduling form...
      </div>
    ),
  },
);

type SheetSchedulingProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  selectedItem?: schedulingWithId | null;
  organizations: SchedulingOrganizationOption[];
};

export default function SheetSchedualing({
  open,
  onOpenChange,
  mode,
  selectedItem,
  organizations,
}: SheetSchedulingProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-[90vw] sm:!w-[70vw] lg:!w-[35vw] !max-w-none px-5 overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Create scheduling" : "Edit scheduling"}
          </SheetTitle>
        </SheetHeader>

        {mode === "create" ? (
          <SchedulingForm
            onSuccess={() => onOpenChange(false)}
            organizations={organizations}
          />
        ) : selectedItem ? (
          <SchedulingUpdateForm
            initialData={selectedItem}
            onSuccess={() => onOpenChange(false)}
            organizations={organizations}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
