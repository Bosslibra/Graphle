'use client';

// this is a catcher of not localized requests, for requests that are not matched by next-intl proxy

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Page not found</h2>
      <p className="text-muted-foreground">Could not find requested resource</p>
      <Button asChild>
        <Link href="/">Go back home</Link>
      </Button>
    </div>
  );
}