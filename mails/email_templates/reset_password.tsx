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

interface EmailTemplateProps {
  email: string;
  resetLink: string;
}

export default function ResetPasswordEmailTemplate({
  email,
  resetLink,
}: EmailTemplateProps) {
  return (
    <Html>
      <Head />

      <Preview>Reset your password</Preview>

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
            borderRadius: "12px",
            padding: "40px",
            maxWidth: "560px",
            margin: "0 auto",
            border: "1px solid #e5e7eb",
          }}
        >
          <Heading
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#111827",
              marginBottom: "20px",
            }}
          >
            Reset your password
          </Heading>

          <Text
            style={{
              fontSize: "16px",
              color: "#374151",
              lineHeight: "24px",
              marginBottom: "16px",
            }}
          >
            We received a request to reset the password for:
          </Text>

          <Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "28px",
            }}
          >
            {email}
          </Text>

          <Text
            style={{
              fontSize: "16px",
              color: "#374151",
              lineHeight: "24px",
              marginBottom: "32px",
            }}
          >
            Click the button below to choose a new password.
          </Text>

          <Section style={{ textAlign: "center", marginBottom: "32px" }}>
            <Button
              href={resetLink}
              style={{
                backgroundColor: "#111827",
                color: "#ffffff",
                padding: "14px 24px",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "600",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Reset Password
            </Button>
          </Section>

          <Text
            style={{
              fontSize: "14px",
              color: "#6b7280",
              lineHeight: "22px",
            }}
          >
            If you didn’t request a password reset, you can safely ignore this
            email.
          </Text>

          <Hr
            style={{
              borderColor: "#e5e7eb",
              margin: "32px 0",
            }}
          />

          <Text
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              textAlign: "center",
            }}
          >
            This link will expire in 15 minutes.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
