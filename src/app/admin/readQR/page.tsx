import { ReadQR } from "~/app/_components/ReadQR";
import { HydrateClient } from "~/trpc/server";

export default async function HomePage() {
  return (
    <HydrateClient>
      <ReadQR />
    </HydrateClient>
  );
}
