import { api, HydrateClient } from "~/trpc/server";
import { GenerateBlankTicket } from "~/app/_components/GenerateBlankTicket";
import MyTicketsTable from "~/app/_components/MyTicketsTable";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  void api.ticketType.list.prefetch();

  return (
    <HydrateClient>
      <GenerateBlankTicket />
      <div className="p-6">
        <MyTicketsTable />
      </div>
    </HydrateClient>
  );
}
