"use client";

import { api } from "~/trpc/react";

export function ValidationStats() {
  const { data, isLoading } = api.validation.getValidationStats.useQuery();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-gray-800"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
        <p className="text-sm text-gray-400">Total Validaciones</p>
        <p className="text-3xl font-bold">{data.totalValidations}</p>
      </div>
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
        <p className="text-sm text-gray-400">Tickets Únicos</p>
        <p className="text-3xl font-bold">{data.uniqueTicketsValidated}</p>
      </div>
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
        <p className="text-sm text-gray-400">Validaciones Hoy</p>
        <p className="text-3xl font-bold">{data.validationsToday}</p>
      </div>
    </div>
  );
}
