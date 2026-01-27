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
  const canValidate = user?.role === 'admin' || user?.role === 'guard';
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="font-serif text-xl text-foreground hover:text-primary transition-colors">
            La Mancha
          </Link>

          {/* Navigation & User */}
          <div className="flex items-center gap-4">
            {/* Admin navigation */}
            {(canAccessAdmin || canValidate) && (
              <div className="hidden sm:flex items-center gap-1">
                {canAccessAdmin && (
                  <Link
                    href="/admin/generateBlankTicket"
                    className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-all"
                  >
                    Mis Tickets
                  </Link>
                )}
                {canValidate && (
                  <Link
                    href="/admin/readQR"
                    className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-all"
                  >
                    Validar Tickets
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin/validations"
                    className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-all"
                  >
                    Registros
                  </Link>
                )}
              </div>
            )}

            {/* User section */}
            <div className="flex items-center gap-3">
              {user && (
                <span className="hidden md:block text-sm text-muted-foreground truncate max-w-[150px]">
                  {user.email}
                </span>
              )}

              {user ? (
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border hover:border-primary/50 rounded-full transition-all"
                >
                  Salir
                </button>
              ) : (
                <button
                  onClick={() => login()}
                  className="px-5 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-all"
                >
                  Entrar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile admin nav */}
      {(canAccessAdmin || canValidate) && (
        <div className="sm:hidden border-t border-border bg-muted/50">
          <div className="flex">
            {canAccessAdmin && (
              <Link
                href="/admin/generateBlankTicket"
                className="flex-1 px-4 py-3 text-center text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                Mis Tickets
              </Link>
            )}
            {canAccessAdmin && canValidate && <div className="w-px bg-border" />}
            {canValidate && (
              <Link
                href="/admin/readQR"
                className="flex-1 px-4 py-3 text-center text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                Validar Tickets
              </Link>
            )}
            {isAdmin && (
              <>
                <div className="w-px bg-border" />
                <Link
                  href="/admin/validations"
                  className="flex-1 px-4 py-3 text-center text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  Registros
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
