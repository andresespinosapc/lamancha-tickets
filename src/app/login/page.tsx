import { HydrateClient } from "~/trpc/server";
import { Login } from "../_components/Login";
import { auth } from "~/server/auth";

export default async function LoginPage() {
  const session = await auth();

  console.log('session:', session);

  return (
    <HydrateClient>
      <Login />
    </HydrateClient>
  );
}
