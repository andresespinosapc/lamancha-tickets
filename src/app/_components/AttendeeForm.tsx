'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';

const AttendeeFormSchema = z.object({
  firstName: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  lastName: z.string().min(2, {
    message: 'El apellido debe tener al menos 2 caracteres.',
  }),
  email: z.string().email({
    message: 'Por favor, ingresa una dirección de correo electrónico válida.',
  }),
  phone: z.string().optional(),
  documentId: z.string().regex(/^(\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]{1})|(\d{8,9}[-][0-9kK]{1})$/, {
    message: 'Por favor, ingresa un RUT válido (ej. 12.345.678-9 o 12345678-9).',
  }),
});
export type AttendeeFormValues = z.infer<typeof AttendeeFormSchema>;

export function AttendeeForm(props: {
  onSubmit: (values: AttendeeFormValues) => void
  isSubmitting: boolean
}) {
  const form = useForm<AttendeeFormValues>({
    resolver: zodResolver(AttendeeFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      documentId: '',
    },
  });

  const formatRUT = (value: string) => {
    const cleaned = value.replace(/[^\dKk]/g, '').toUpperCase();

    let formatted = '';
    if (cleaned.length > 1) {
      formatted = `-${cleaned.slice(-1)}`;
      let body = cleaned.slice(0, -1);
      while (body.length > 3) {
        formatted = `.${body.slice(-3)}${formatted}`;
        body = body.slice(0, -3);
      }
      formatted = body + formatted;
    } else {
      formatted = cleaned;
    }

    return formatted;
  };

  const handleRUTChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRUT(event.target.value);
    form.setValue('documentId', formatted, { shouldValidate: true });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Registro</CardTitle>
        <CardDescription>Por favor, completa el formulario a continuación para registrarte.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(props.onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
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
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (opcional)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+56 9 1234 5678" {...field} />
                  </FormControl>
                  <FormDescription>
                    Ingresa tu número de teléfono incluyendo el código de país.
                  </FormDescription>
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
              name="documentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RUT</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="12.345.678-9"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleRUTChange(e);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Ingresa tu RUT (ej. 12.345.678-9 o 12345678-9).
                  </FormDescription>
                  <FormMessage>
                    {form.formState.errors[field.name]?.message && (
                      <span role="alert">{form.formState.errors[field.name]?.message}</span>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={props.isSubmitting}>
              {props.isSubmitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
