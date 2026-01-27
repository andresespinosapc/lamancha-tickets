import { ValidationRecordsTable } from "./_components/ValidationRecordsTable";
import { ValidationStats } from "./_components/ValidationStats";

export const dynamic = "force-dynamic";

export default function ValidationsPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Registros de Validación</h1>
      <ValidationStats />
      <ValidationRecordsTable />
    </div>
  );
}
