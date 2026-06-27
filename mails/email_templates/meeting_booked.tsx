import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type MeetingBookedEmailTemplateProps = {
  recipientName: string;
  organizerName: string;
  title: string;
  startDate: Date;
  endDate: Date;
  meetingLink?: string | null;
  location?: string | null;
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function MeetingBookedEmailTemplate({
  recipientName,
  organizerName,
  title,
  startDate,
  endDate,
  meetingLink,
  location,
}: MeetingBookedEmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>{organizerName} booked a meeting with you</Preview>
      <Body
        style={{
          backgroundColor: "#f6f9fc",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          padding: "40px 20px",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            margin: "0 auto",
            maxWidth: "560px",
            padding: "40px",
          }}
        >
          <Heading
            style={{
              color: "#111827",
              fontSize: "26px",
              fontWeight: "700",
              marginBottom: "20px",
            }}
          >
            New meeting booked
          </Heading>

          <Text style={{ color: "#374151", fontSize: "16px", lineHeight: "24px" }}>
            Hi {recipientName}, {organizerName} booked a meeting with you.
          </Text>

          <Section
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              margin: "24px 0",
              padding: "20px",
            }}
          >
            <Text style={{ color: "#111827", fontSize: "16px", fontWeight: "700" }}>
              {title}
            </Text>
            <Text style={{ color: "#374151", fontSize: "14px", lineHeight: "22px" }}>
              {dateFormatter.format(startDate)} - {dateFormatter.format(endDate)}
            </Text>
            {location ? (
              <Text style={{ color: "#374151", fontSize: "14px", lineHeight: "22px" }}>
                Location: {location}
              </Text>
            ) : null}
          </Section>

          {meetingLink ? (
            <Section style={{ marginBottom: "28px", textAlign: "center" }}>
              <Button
                href={meetingLink}
                style={{
                  backgroundColor: "#111827",
                  borderRadius: "10px",
                  color: "#ffffff",
                  display: "inline-block",
                  fontSize: "16px",
                  fontWeight: "600",
                  padding: "14px 24px",
                  textDecoration: "none",
                }}
              >
                Join meeting
              </Button>
            </Section>
          ) : null}

          <Hr style={{ borderColor: "#e5e7eb", margin: "32px 0" }} />

          <Text style={{ color: "#6b7280", fontSize: "13px", lineHeight: "20px" }}>
            This notification was sent because your Scholar schedule was booked.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
