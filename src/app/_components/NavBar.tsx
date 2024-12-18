'use client';

import Cookies from "universal-cookie";
import { api } from "~/trpc/react";

export default function NavBar() {
  const { data: user } = api.user.me.useQuery();

  function login() {
    window.location.href = "/login";
  }

  function logout() {
    new Cookies().remove("token", { path: "/" });

    window.location.href = "/";
  }

  return (
    <>
      <div className="flex justify-end p-3">
        <div className="flex flex-col items-end">
          <p className="text-center">
            {user && <span>{user.email}</span>}
          </p>
          <div className="mt-2">
            {user ? (
              <button
                className="rounded-full bg-white/10 font-semibold no-underline transition hover:bg-white/20"
                onClick={() => logout()}
              >
                Cerrar sesión
              </button>
            ) : (
              <button
                className="rounded-full bg-white/10 font-semibold no-underline transition hover:bg-white/20"
                onClick={() => login()}
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
