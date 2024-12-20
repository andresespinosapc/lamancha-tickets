'use client';

import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

export function ResendBlankTicketEmailButton(props: {
  ticket: {
    hashid: string;
    attendee: {
      email: string;
    }
  }
}) {
  const { toast } = useToast();

  const resendBlankTicketEmail = api.ticket.resendBlankTicketEmail.useMutation();

  async function handleResendEmail() {
    await resendBlankTicketEmail.mutateAsync({ ticketHashid: props.ticket.hashid }).then(() => {
      toast({
        variant: 'success',
        title: "Correo enviado correctamente",
        description: `Al correo ${props.ticket.attendee.email}`,
      });
    }).catch((error: Error) => {
      toast({
        variant: 'destructive',
        title: "Error al enviar correo",
        description: error.message,
      });
    });
  }

  return (
    <Button
      loading={resendBlankTicketEmail.isPending}
      variant="outline"
      size="sm"
      onClick={() => handleResendEmail()}
    >
      Re-enviar correo
    </Button>
  );
}
