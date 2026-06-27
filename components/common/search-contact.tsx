"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { ContactTypeProps } from "@/types/contact.types";
import { findContactsWithConnection } from "@/app/actions/contacts";
import { cn } from "@/lib/utils";

type Props = {
  userId: string;
  className?: string;
  searchCallback: (contacts: ContactTypeProps[]) => void;
};

export default function SearchContact({
  userId,
  className,
  searchCallback,
}: Props) {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const searchedContacts = await findContactsWithConnection(
          userId,
          value,
        );
        searchCallback(searchedContacts);
      } catch (error) {
        console.error(error);
      }
    };

    fetchContacts();
  }, [value]);

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Find contact"
      className={cn(`${className}`)}
    />
  );
}
