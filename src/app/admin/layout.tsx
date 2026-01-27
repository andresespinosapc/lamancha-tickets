import NavBar from "../_components/NavBar";
import { api } from "~/trpc/server";
import { redirect } from "next/navigation";

export default async function Layout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const user = await api.user.me();

  // Protect admin routes - only sellers and admins
  if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
    redirect('/login');
  }

  return (
    <>
      <NavBar />
      <main>{children}</main>
    </>
  );
}
