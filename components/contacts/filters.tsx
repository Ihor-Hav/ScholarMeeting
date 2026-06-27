import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { filterContacts } from "@/app/actions/contacts";
import { useState, useEffect } from "react";
import type { ContactTypeProps } from "@/types/contact.types";

interface ContactFiltersProps {
  userId: string;
  onFilterCallback: (contacts: ContactTypeProps[]) => void;
}

export default function ContactFilters({
  userId,
  onFilterCallback,
}: ContactFiltersProps) {
  const choices = ["latest", "newest", "ascending", "descending"];
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    if (!filter) return;

    const fetchContacts = async () => {
      const contacts = await filterContacts(userId, filter);
      onFilterCallback(contacts);
    };

    fetchContacts();
  }, [filter, userId, onFilterCallback]);

  return (
    <NativeSelect
      className="min-w-50"
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
    >
      <NativeSelectOption value="" disabled>
        Select filter
      </NativeSelectOption>

      {choices.map((item) => (
        <NativeSelectOption key={item} value={item}>
          {item}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}
