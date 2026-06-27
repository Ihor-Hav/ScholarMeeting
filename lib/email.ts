import { Resend } from "resend";
import { render } from "@react-email/render";
import { MeetingInvitationEmail } from "@/mails/email_templates/meeting_invitation";
import { MeetingRescheduledEmail } from "@/mails/email_templates/meeting_rescheduled";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail =
  process.env.RESEND_FROM_EMAIL ||
  "Scholar <notifications@scholarshipmeetings.online>";

export async function sendMeetingInvitationEmail(input: { to: string; title: string; inviterName: string; startDate: Date; meetingLink?: string | null }) {
  if (!resend) return;

  await resend.emails.send({
    from: fromEmail,
    to: input.to,
    subject: `Invitation: ${input.title}`,
    html: await render(MeetingInvitationEmail({
      title: input.title,
      inviterName: input.inviterName,
      startDate: input.startDate.toLocaleString(),
      meetingLink: input.meetingLink,
    })),
  });
}

export async function sendMeetingRescheduledEmail(input: {
  to: string;
  title: string;
  startDate: Date;
  endDate: Date;
  meetingLink?: string | null;
}) {
  if (!resend) return;

  await resend.emails.send({
    from: fromEmail,
    to: input.to,
    subject: `Rescheduled: ${input.title}`,
    html: await render(
      MeetingRescheduledEmail({
        title: input.title,
        startDate: input.startDate.toLocaleString(),
        endDate: input.endDate.toLocaleString(),
        meetingLink: input.meetingLink,
      }),
    ),
  });
}
