import { redirect } from 'next/navigation';

/** @deprecated Use `/admin/owners` — vehicle hosts are owners, not renters */
export default function AdminRentersRedirectPage() {
  redirect('/admin/owners');
}
