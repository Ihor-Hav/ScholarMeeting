"use client";

import { UploadButton } from "@/utils/uploadingthing";

export default function UploadAvatarButton() {
  return (
    <div className="inline-flex w-full">
      <UploadButton
        endpoint="imageUploader"
        className="upload-avatar-btn w-full"
        appearance={{
          container: {
            width: "100%",
          },
          button: {
            width: "100%",
            backgroundColor: "#363636",
            color: "#E6E3E1",
            padding: "0.55rem 1.1rem",
            borderRadius: "0.6rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            border: "1px solid #525254",
            boxShadow: "0 1px 2px rgba(0,0,0,0.45)",
          },
          allowedContent: {
            display: "none",
          },
        }}
        onClientUploadComplete={(res) => {
          console.error("Files: ", res);
        }}
        onUploadError={(error: Error) => {
          alert(error.message);
        }}
      />
    </div>
  );
}
