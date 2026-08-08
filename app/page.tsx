/**
 * Root page — immediately redirects to /login.
 * After successful auth, middleware routes to /customer or /merchant.
 */
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/login');
}
