import NavBar from "../_components/NavBar";
import { api } from "~/trpc/server";
import { redirect } from "next/navigation";

export default async function Layout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const user = await api.user.me();

  // Protect admin routes - sellers, admins, and guards
  if (!user || !['seller', 'admin', 'guard'].includes(user.role ?? '')) {
    redirect('/login');
  }

  return (
    <>
      <NavBar />
      <main>{children}</main>
    </>
  );
}
