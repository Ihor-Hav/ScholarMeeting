import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

type Props = {
  title: string;
  startDate: string;
  endDate: string;
  meetingLink?: string | null;
};

export function MeetingRescheduledEmail({
  title,
  startDate,
  endDate,
  meetingLink,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>{title} has been rescheduled</Preview>
      <Body
        style={{
          backgroundColor: "#f6f7fb",
          fontFamily: "Arial, sans-serif",
          padding: "24px",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <Heading>Meeting rescheduled</Heading>
          <Text>
            <strong>{title}</strong> has a new date and time.
          </Text>
          <Text>Starts: {startDate}</Text>
          <Text>Ends: {endDate}</Text>
          {meetingLink ? <Link href={meetingLink}>Join meeting</Link> : null}
        </Container>
      </Body>
    </Html>
  );
}
