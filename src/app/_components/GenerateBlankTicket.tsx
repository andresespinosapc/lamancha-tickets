'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';
import { api } from '~/trpc/react';
import { useState } from 'react';

const EmailFormSchema = z.object({
  email: z.string().email({
    message: 'Por favor, ingresa una dirección de correo electrónico válida.',
  }),
});
export type EmailFormValues = z.infer<typeof EmailFormSchema>;

export function GenerateBlankTicket() {
  const [defaultTicketType] = api.ticketType.getDefaultTicketType.useSuspenseQuery();
  const generateBlankTickets = api.ticket.generateBlankTickets.useMutation();
  const [submittedEmail, setSubmittedEmail] = useState<string>();

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(EmailFormSchema),
    defaultValues: {
      email: '',
    },
  });

  function onSubmit(values: EmailFormValues) {
    if (defaultTicketType === null) throw new Error('Default ticket type is null');

    generateBlankTickets.mutate({
      tickets: [{
        ticketTypeId: defaultTicketType.id,
        attendee: {
          email: values.email,
        },
      }]
    });
    setSubmittedEmail(values.email);
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-6">
      <CardHeader>
        <CardTitle>Generar ticket en blanco</CardTitle>
        <CardDescription>Ingresa el correo de la persona a la que le quieres generar el ticket.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors[field.name]?.message && (
                      <span role="alert">{form.formState.errors[field.name]?.message}</span>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />
            <div>
              <Button type="submit" className="w-full" disabled={generateBlankTickets.isPending}>
                {generateBlankTickets.isPending ? 'Enviando...' : 'Enviar'}
              </Button>
              {generateBlankTickets.error && (
                <div role="alert" className="mt-2 text-sm text-pink-600 font-bold">{generateBlankTickets.error.message}</div>
              )}
              {generateBlankTickets.isSuccess && (
                <div role="alert" className="mt-2 text-sm text-green-500 font-bold">¡Listo! Se envió un correo a {submittedEmail}</div>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
