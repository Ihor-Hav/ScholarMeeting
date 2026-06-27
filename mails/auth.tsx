import { Resend } from "resend";
import ResetPasswordEmailTemplate from "@/mails/email_templates/reset_password";
import MeetingBookedEmailTemplate from "@/mails/email_templates/meeting_booked";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail =
  process.env.RESEND_FROM_EMAIL ||
  "Scholar <notifications@scholarshipmeetings.online>";

export async function sendResetPasswordEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  if (!process.env.RESEND_API_KEY) return null;

  return resend.emails.send({
    from: fromEmail,
    to: email,
    subject: "Reset Password",

    react: <ResetPasswordEmailTemplate email={email} resetLink={resetUrl} />,
  });
}

type MeetingBookedEmailInput = {
  to: string;
  recipientName: string;
  organizerName: string;
  title: string;
  startDate: Date;
  endDate: Date;
  meetingLink?: string | null;
  location?: string | null;
};

export async function sendMeetingBookedEmail(input: MeetingBookedEmailInput) {
  if (!process.env.RESEND_API_KEY) return null;

  return resend.emails.send({
    from: fromEmail,
    to: input.to,
    subject: `${input.organizerName} booked ${input.title}`,
    react: <MeetingBookedEmailTemplate {...input} />,
  });
}
