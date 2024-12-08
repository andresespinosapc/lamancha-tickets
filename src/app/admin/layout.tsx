import Link from "next/link";
import { auth } from "~/server/auth";

export default async function Layout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  console.log('session:', session);

  return (
    <>
      <div className="flex justify-end p-3">
        <div className="flex flex-col items-end">
          <p className="text-center">
            {session && <span>{session.user?.email}</span>}
          </p>
          <div className="mt-2">
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded-full bg-white/10 font-semibold no-underline transition hover:bg-white/20"
            >
              {session ? "Cerrar sesión" : "Iniciar sesión"}
            </Link>
          </div>
        </div>
      </div>
      <main>{children}</main>
    </>
  );
}
