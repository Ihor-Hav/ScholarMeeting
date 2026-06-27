import { Body, Container, Head, Heading, Html, Link, Preview, Text } from "@react-email/components";

export function MeetingInvitationEmail({ title, inviterName, startDate, meetingLink }: { title: string; inviterName: string; startDate: string; meetingLink?: string | null }) {
  return (
    <Html>
      <Head />
      <Preview>You have been invited to {title}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f6f7fb", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "24px" }}>
          <Heading>Meeting invitation</Heading>
          <Text>{inviterName} invited you to <strong>{title}</strong>.</Text>
          <Text>Starts: {startDate}</Text>
          {meetingLink && <Link href={meetingLink}>Join meeting</Link>}
        </Container>
      </Body>
    </Html>
  );
}
