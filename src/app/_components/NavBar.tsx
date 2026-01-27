'use client';

import Cookies from "universal-cookie";
import { api } from "~/trpc/react";
import Link from "next/link";

export default function NavBar() {
  const { data: user } = api.user.me.useQuery();

  function login() {
    window.location.href = "/login";
  }

  function logout() {
    new Cookies().remove("token", { path: "/" });

    window.location.href = "/";
  }

  const canAccessAdmin = user?.role === 'admin' || user?.role === 'seller';

  return (
    <>
      <div className="flex justify-between items-center p-3">
        {/* Logo/Home link */}
        <Link href="/" className="text-xl font-bold hover:opacity-80 transition">
          🎫 Lamancha Tickets
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-6">
          {canAccessAdmin && (
            <nav className="flex gap-4">
              <Link
                href="/admin/generateBlankTicket"
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition font-medium"
              >
                Mis Tickets
              </Link>
              <Link
                href="/admin/readQR"
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition font-medium"
              >
                Leer QR
              </Link>
            </nav>
          )}

          {/* User section */}
          <div className="flex flex-col items-end">
            <p className="text-sm text-gray-300">
              {user && <span>{user.email}</span>}
            </p>
            <div className="mt-1">
              {user ? (
                <button
                  className="px-4 py-2 rounded-lg bg-white/10 font-semibold hover:bg-white/20 transition text-sm"
                  onClick={() => logout()}
                >
                  Cerrar sesión
                </button>
              ) : (
                <button
                  className="px-4 py-2 rounded-lg bg-white/10 font-semibold hover:bg-white/20 transition text-sm"
                  onClick={() => login()}
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
