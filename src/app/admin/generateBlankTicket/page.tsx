import { api, HydrateClient } from "~/trpc/server";
import { GenerateBlankTicket } from "~/app/_components/GenerateBlankTicket";

export default async function HomePage() {
  void api.ticketType.getDefaultTicketType.prefetch();

  return (
    <HydrateClient>
      <GenerateBlankTicket />
    </HydrateClient>
  );
}
