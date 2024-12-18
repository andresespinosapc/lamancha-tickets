'use client';

import { api } from "~/trpc/react";
import Cookies from 'universal-cookie';
import { useForm } from 'react-hook-form';
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

type FormData = {
  email: string;
  password: string;
}

export function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const login = api.auth.login.useMutation();

  const onSubmit = async (data: FormData) => {
    const { token } = await login.mutateAsync({ email: data.email, password: data.password });

    new Cookies().set('token', token, { path: '/', maxAge: 2*7*24*60*60 });

    window.location.href = '/';
  };

  return (
    <div className="flex justify-center pt-6">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>¡Hola!</CardTitle>
          <CardDescription>Ingresa tus credenciales.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="tu@email.com"
                  {...register("email", { 
                    required: "Anda, no te olvides del correo", 
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Mmm... ¿seguro que ese correo está bien?"
                    }
                  })}
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password" 
                  type="password"
                  {...register("password")}
                />
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
              </div>
            </div>
            {login.error && <p className="text-sm text-red-500 mt-2">{login.error.message}</p>}
            <Button className="w-full mt-4" type="submit">Entrar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
