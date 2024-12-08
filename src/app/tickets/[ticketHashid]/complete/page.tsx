import { HydrateClient } from "~/trpc/server";
import { CompleteBlankTicket } from "~/app/_components/CompleteBlankTicket";

export default async function HomePage({
  params,
}: {
  params: Promise<{ ticketHashid: string }>;
}) {
  const ticketHashid = (await params).ticketHashid;

  return (
    <HydrateClient>
      <CompleteBlankTicket ticketHashid={ticketHashid} />
    </HydrateClient>
  );
}
