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

const FormSchema = z.object({
  email: z.string().email({
    message: 'Por favor, ingresa una dirección de correo electrónico válida.',
  }),
  ticketTypeId: z.string().min(1, {
    message: 'Por favor, selecciona un tipo de ticket.',
  }),
});
export type FormValues = z.infer<typeof FormSchema>;

export function GenerateBlankTicket() {
  const [ticketTypes] = api.ticketType.list.useSuspenseQuery();
  const generateBlankTickets = api.ticket.generateBlankTickets.useMutation();
  const [submittedEmail, setSubmittedEmail] = useState<string>();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      ticketTypeId: ticketTypes[0]?.id.toString() ?? '',
    },
  });

  function onSubmit(values: FormValues) {
    generateBlankTickets.mutate({
      tickets: [{
        ticketTypeId: parseInt(values.ticketTypeId),
        attendee: {
          email: values.email,
        },
      }]
    });
    setSubmittedEmail(values.email);
  }

  if (ticketTypes.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto mt-6">
        <CardHeader>
          <CardTitle>No hay tipos de tickets</CardTitle>
          <CardDescription>Por favor, crea al menos un tipo de ticket primero.</CardDescription>
        </CardHeader>
      </Card>
    );
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
            <FormField
              control={form.control}
              name="ticketTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de ticket</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {ticketTypes.map((ticketType) => (
                        <option key={ticketType.id} value={ticketType.id}>
                          {ticketType.name} - ${ticketType.price.toLocaleString()}
                        </option>
                      ))}
                    </select>
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
