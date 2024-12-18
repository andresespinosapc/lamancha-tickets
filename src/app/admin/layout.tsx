import NavBar from "../_components/NavBar";

export default async function Layout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
    </>
  );
}
