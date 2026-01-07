import { redirect } from 'next/navigation';

// Redirect old login URL to the new one
export default function AdminLoginRedirect() {
  redirect('/mylogin');
}
