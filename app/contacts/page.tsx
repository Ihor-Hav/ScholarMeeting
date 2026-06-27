"use client";
import { useSession } from "next-auth/react";
import DialogContacts from "@/components/contacts/dialog-contacts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { getAllContacts } from "@/app/actions/contacts";
import type { ContactTypeProps } from "@/types/contact.types";
import Contact from "@/components/contacts/contact";
import SearchContact from "@/components/common/search-contact";
import ContactFilters from "@/components/contacts/filters";
import { useCallback } from "react";

const ContactsPage = () => {
  const { data: session, status } = useSession();
  const [contacts, setContacts] = useState<ContactTypeProps[]>([]);

  const myId = session?.user.id;

  useEffect(() => {
    if (!myId) return;

    const fetchAllContacts = async () => {
      try {
        const fetchedContacts = await getAllContacts(myId);
        setContacts(Array.isArray(fetchedContacts) ? fetchedContacts : []);
      } catch (error) {
        console.error(error);
        setContacts([]);
      }
    };

    fetchAllContacts();
  }, [myId]);

  function onAccept(callbackContact: ContactTypeProps) {
    setContacts((prev) =>
      prev?.map((contact) =>
        contact.id === callbackContact.id ? callbackContact : contact,
      ),
    );
  }

  function onSent(callbackContact: ContactTypeProps) {
    setContacts((prev) => {
      if (!prev) return [callbackContact];

      return [...prev, callbackContact];
    });
  }

  function onDeleteContact(callbackContact: ContactTypeProps) {
    setContacts((prev) =>
      prev?.filter((contact) => contact.id !== callbackContact.id),
    );
  }

  function onCancelContact(callbackContact: ContactTypeProps) {
    setContacts((prev) =>
      prev?.filter((contact) => contact.id !== callbackContact.id),
    );
  }

  function onRejectContact(callbackContact: ContactTypeProps) {
    setContacts((prev) =>
      prev?.filter((contact) => contact.id !== callbackContact.id),
    );
  }

  function onSearch(callbackContacts: ContactTypeProps[]) {
    setContacts(callbackContacts);
  }

  const onFilter = useCallback((filteredContacts: ContactTypeProps[]) => {
    setContacts(filteredContacts);
  }, []);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  const accepted = contacts?.filter((c) => c.status === "ACCEPTED");
  const incoming = contacts?.filter(
    (c) => c.status === "PENDING" && c.requested_by_id !== myId,
  );
  const sent = contacts?.filter(
    (c) => c.status === "PENDING" && c.requested_by_id === myId,
  );
  const blocked = contacts?.filter(
    (c) => c.status === "BLOCKED" && c.requested_by_id === myId,
  );

  return (
    <div>
      <div className="flex justify-between items-center border-b slate-700/20 px-4 py-5">
        <h2 className="text-2xl font-medium">Contacts</h2>
        <div className="flex gap-3">
          <div className="flex justify-end mx-2 w-full">
            <SearchContact
              userId={session?.user.id ?? ""}
              searchCallback={onSearch}
            />
          </div>
          <ContactFilters
            userId={session?.user.id ?? ""}
            onFilterCallback={onFilter}
          ></ContactFilters>
          <DialogContacts
            invite_token={session?.user.invite_token || ""}
            userId={myId ?? null}
            onAddNewContactCallback={onSent}
          />
        </div>
      </div>

      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="flex justify-end w-full rounded-none">
          <TabsTrigger value="contacts">
            Contacts
            <span className="text-green-400">({accepted?.length})</span>
          </TabsTrigger>
          <TabsTrigger value="incoming">
            Incoming{" "}
            <span className="text-green-400">({incoming?.length})</span>
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent <span className="text-neutral-400">({sent?.length})</span>
          </TabsTrigger>
        </TabsList>

        <div className="px-4">
          <TabsContent value="contacts">
            <div className="space-y-2">
              {accepted && accepted.length > 0 ? (
                accepted.map((c) => (
                  <Contact
                    key={c.id}
                    contact={c}
                    myUserId={myId!}
                    onDeleteCallback={onDeleteContact}
                  />
                ))
              ) : (
                <p className="text-muted-foreground p-4">No contacts yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="incoming">
            <div className="space-y-2">
              {incoming && incoming.length > 0 ? (
                incoming.map((c) => (
                  <Contact
                    key={c.id}
                    contact={c}
                    myUserId={myId!}
                    onAcceptCallback={onAccept}
                    onRejectCallback={onRejectContact}
                  />
                ))
              ) : (
                <p className="text-muted-foreground p-4">
                  No incoming requests.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sent">
            <div className="space-y-2">
              {sent && sent.length > 0 ? (
                sent.map((c) => (
                  <Contact
                    key={c.id}
                    contact={c}
                    myUserId={myId!}
                    onCancelCallback={onCancelContact}
                  />
                ))
              ) : (
                <p className="text-muted-foreground p-4">No sent requests.</p>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ContactsPage;
