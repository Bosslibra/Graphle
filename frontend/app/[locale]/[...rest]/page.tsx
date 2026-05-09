// This is a catch-all page to handle 404s

import {notFound} from 'next/navigation';
 
export default function CatchAllPage() {
  notFound();
}