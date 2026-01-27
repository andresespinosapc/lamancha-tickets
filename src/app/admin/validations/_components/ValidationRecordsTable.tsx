"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function ValidationRecordsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading } = api.validation.listAllValidations.useQuery({
    search: search || undefined,
    limit,
    offset: page * limit,
  });

  if (isLoading) {
    return <div className="py-8 text-center">Cargando...</div>;
  }

  const validations = data?.validations ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por nombre, email, RUT..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="max-w-sm"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                Fecha/Hora
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                Asistente
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                RUT
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                Tipo Ticket
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                Guardia
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                Servidor
              </th>
            </tr>
          </thead>
          <tbody>
            {validations.map((v) => (
              <tr key={v.id} className="border-b border-gray-800">
                <td className="px-4 py-3 text-sm">
                  {new Date(v.validatedAt).toLocaleString("es-CL")}
                </td>
                <td className="px-4 py-3 text-sm">
                  {v.ticket.attendee.firstName} {v.ticket.attendee.lastName}
                </td>
                <td className="px-4 py-3 text-sm">{v.ticket.attendee.email}</td>
                <td className="px-4 py-3 text-sm">
                  {v.ticket.attendee.documentId}
                </td>
                <td className="px-4 py-3 text-sm">{v.ticket.ticketType.name}</td>
                <td className="px-4 py-3 text-sm">
                  {v.guard.name ?? v.guard.email}
                </td>
                <td className="px-4 py-3 text-sm">
                  {v.localServerId ? (
                    <span className="rounded bg-blue-900 px-2 py-1 text-xs text-blue-200">
                      Local: {v.localServerId}
                    </span>
                  ) : (
                    <span className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300">
                      Global
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 md:hidden">
        {validations.map((v) => (
          <div
            key={v.id}
            className="rounded-lg border border-gray-700 bg-gray-800 p-4"
          >
            <div className="mb-2 flex justify-between">
              <span className="text-sm text-gray-400">Fecha:</span>
              <span className="text-sm">
                {new Date(v.validatedAt).toLocaleString("es-CL")}
              </span>
            </div>
            <div className="mb-2 flex justify-between">
              <span className="text-sm text-gray-400">Asistente:</span>
              <span className="text-sm">
                {v.ticket.attendee.firstName} {v.ticket.attendee.lastName}
              </span>
            </div>
            <div className="mb-2 flex justify-between">
              <span className="text-sm text-gray-400">RUT:</span>
              <span className="text-sm">{v.ticket.attendee.documentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Guardia:</span>
              <span className="text-sm">{v.guard.name ?? v.guard.email}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {validations.length === 0 && (
        <div className="py-8 text-center text-gray-400">
          No se encontraron validaciones
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Mostrando {page * limit + 1}-{Math.min((page + 1) * limit, total)} de{" "}
            {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
