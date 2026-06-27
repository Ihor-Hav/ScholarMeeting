export type ContactUser = {
  id: string;
  name: string;
  email?: string;
  lastname: string;
};

export type ContactTypeProps = {
  id: string;
  status: "PENDING" | "BLOCKED" | "ACCEPTED";
  user1Id: string;
  user2Id: string;
  requested_by_id: string;
  user1: ContactUser;
  user2: ContactUser;
};
