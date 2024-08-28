import { ClerkLoaded } from "@clerk/nextjs";
import React from "react";
import Header from "@/components/Header";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // Ensure that Clerk has fully loaded before rendering the layout
    <ClerkLoaded>
      <div className="flex-1 flex flex-col h-screen">
        {/* Header Component */}
        <Header />
        {/* Main Content Area: Displays the children components passed to the layout */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </ClerkLoaded>
  );
};

export default DashboardLayout;
