import Link from "next/link";
import ClientDetail from "@/components/ClientDetail";
import CommercialLifecycle from "@/components/CommercialLifecycle";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#f4f7f8] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto mb-4 flex max-w-5xl justify-end">
        <Link href={`/clients/${id}/propostas`} className="rounded-lg bg-[#0344F0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0239c9]">
          Abrir propostas
        </Link>
      </div>
      <ClientDetail clientId={id} />
      <CommercialLifecycle clientId={id} />
    </div>
  );
}
