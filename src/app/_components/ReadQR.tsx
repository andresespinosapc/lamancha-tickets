'use client';

import { type IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { type DecryptedRedemptionCode } from '~/server/services/ticket';
import { api } from '~/trpc/react';

export function ReadQR() {
  const [decryptedRedemptionCode, setDecryptedRedemptionCode] = useState<DecryptedRedemptionCode>();
  const decryptRedemptionCode = api.ticket.decryptRedemptionCode.useMutation();

  async function onScan(result: IDetectedBarcode[]) {
    const firstResult = result[0];
    if (firstResult === undefined) throw new Error('No QR code detected');

    const decryptedRedemptionCode = await decryptRedemptionCode.mutateAsync({
      redemptionCode: firstResult.rawValue,
    });

    setDecryptedRedemptionCode(decryptedRedemptionCode);
  }

  if (decryptRedemptionCode.isPending) {
    return <div className="p-3"><p>Loading...</p></div>;
  }

  if (decryptedRedemptionCode) {
    return (
      <div className="p-3">
        <p>Nombre: {decryptedRedemptionCode.attendee.firstName}</p>
        <p>Apellido: {decryptedRedemptionCode.attendee.lastName}</p>
        <p>Email: {decryptedRedemptionCode.attendee.email}</p>
        <p>RUT: {decryptedRedemptionCode.attendee.documentId}</p>
        <p>Teléfono: {decryptedRedemptionCode.attendee.phone ?? 'No ingresado'}</p>
        <div className="mt-3">
          <Button className="w-full" onClick={() => setDecryptedRedemptionCode(undefined)}>
            Volver a escanear
          </Button>
        </div>
      </div>
    );
  }

  return <Scanner onScan={onScan} />;
}
