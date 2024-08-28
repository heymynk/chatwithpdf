import React from "react";
import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { FilePlus2 } from "lucide-react";

function Header() {
  return (
    <div className="flex justify-between items-center bg-white shadow-md p-4 border-b border-gray-200">
      {/* Left Section: Brand name or application title */}
      <Link href="/dashboard" className="text-2xl font-semibold text-gray-800 hover:text-purple-600 transition-colors">
        Chat to <span className="text-purple-600">PDF</span>
      </Link>

      {/* Right Section: Navigation and user options */}
      <SignedIn>
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Pricing link, visible on medium screens and up */}
          <Button asChild variant="link" className="text-gray-600 hover:text-purple-600 transition-colors hidden md:flex">
            <Link href="/dashboard/upgrade">Pricing</Link>
          </Button>

          {/* My Documents link */}
          <Button asChild variant="outline" className="text-gray-800 hover:bg-gray-100">
            <Link href="/dashboard">My Documents</Link>
          </Button>

          {/* Upload button with icon */}
          <Button asChild variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 flex items-center">
            <Link href="/dashboard/upload" className="flex items-center space-x-1">
              <FilePlus2 className="w-5 h-5" />
              <span className="hidden md:inline">Upload</span>
            </Link>
          </Button>

          {/* User Button for authentication and user settings */}
          <div className="flex-shrink-0">
            <UserButton />
          </div>
        </div>
      </SignedIn>
    </div>
  );
}

export default Header;
