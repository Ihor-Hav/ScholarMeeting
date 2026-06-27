"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    router.replace(`?${params.toString()}`);
  }, 300);

  return (
    <Input
      placeholder="Search contacts..."
      onChange={(e) => debouncedSearch(e.target.value)}
    />
  );
}
