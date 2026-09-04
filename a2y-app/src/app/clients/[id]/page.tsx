import ClientDetail from "@/components/ClientDetail";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#f4f7f8] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <ClientDetail clientId={id} />
    </div>
  );
}
