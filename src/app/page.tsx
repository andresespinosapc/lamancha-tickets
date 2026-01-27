import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { Home } from "./_components/Home";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();

  void api.ticketType.list.prefetch();

  return (
    <HydrateClient>
      <Home session={session} />
    </HydrateClient>
  );
}
