import crypto from "crypto";

export function generateInviteToken() {
  return crypto.randomBytes(9).toString("base64url");
}
