import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define a route matcher for protected routes under "/dashboard"
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Middleware to handle authentication, protect routes, and set COOP header
export default clerkMiddleware((auth, req) => {
    const res = NextResponse.next();

    // Set Cross-Origin-Opener-Policy header
    res.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

    // Check if the request matches the protected route pattern
    if (isProtectedRoute(req)) {
        // Protect the route by enforcing authentication
        auth().protect();
    }

    return res;
});

// Configuration for route matching
export const config = {
  matcher: [
    // Exclude Next.js internal routes and static files, except those with search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Apply middleware for all API routes and TRPC routes
    '/(api|trpc)(.*)',
  ],
};
