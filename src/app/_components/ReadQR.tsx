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
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando entrada...</p>
        </div>
      </div>
    );
  }

  if (decryptedRedemptionCode) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Success indicator */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-foreground">Entrada válida</h2>
          </div>

          {/* Ticket card */}
          <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-lg">
            {/* Header */}
            <div className="bg-primary/10 px-6 py-4 border-b border-border">
              <p className="text-sm text-muted-foreground">Asistente</p>
              <p className="font-serif text-xl text-foreground">
                {decryptedRedemptionCode.attendee.firstName} {decryptedRedemptionCode.attendee.lastName}
              </p>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                  <p className="text-foreground">{decryptedRedemptionCode.attendee.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">RUT</p>
                  <p className="text-foreground font-medium">{decryptedRedemptionCode.attendee.documentId}</p>
                </div>
              </div>

              {decryptedRedemptionCode.attendee.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Teléfono</p>
                    <p className="text-foreground">{decryptedRedemptionCode.attendee.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Decorative ticket edge */}
            <div className="relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-card rounded-r-full -ml-2" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-card rounded-l-full -mr-2" />
              <div className="border-t border-dashed border-border" />
            </div>

            {/* Ticket ID */}
            <div className="px-6 py-4 text-center">
              <p className="text-xs text-muted-foreground">Ticket #{decryptedRedemptionCode.ticketId}</p>
            </div>
          </div>

          {/* Action button */}
          <div className="mt-6">
            <Button
              className="w-full rounded-full"
              onClick={() => setDecryptedRedemptionCode(undefined)}
            >
              Escanear otra entrada
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl text-foreground mb-2">Escanear entrada</h2>
          <p className="text-muted-foreground text-sm">Apunta la cámara al código QR del ticket</p>
        </div>
        <div className="rounded-2xl overflow-hidden border border-border">
          <Scanner onScan={onScan} />
        </div>
      </div>
    </div>
  );
}
