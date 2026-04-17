import { redirect } from 'next/navigation';

/** @deprecated Use `/admin/owners/[id]` */
export default async function AdminRenterDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/owners/${id}`);
}
