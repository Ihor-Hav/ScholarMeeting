import UploadThingSSRPlugin from "@/app/uploadthing-ssr-plugin";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UploadThingSSRPlugin />
      {children}
    </>
  );
}
