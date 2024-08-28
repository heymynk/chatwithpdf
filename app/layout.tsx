import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Wrap the application with ClerkProvider for authentication and user management
    <ClerkProvider>
      <html lang="en">
        {/* Body of the document with styling for full-screen layout and overflow control */}
        <body className="min-h-screen h-screen overflow-hidden flex flex-col">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
