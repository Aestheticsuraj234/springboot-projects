"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useLogin, useRegister } from "@/hooks/use-auth";
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from "@/lib/validations/auth";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
    },
  });

  const loginMutation = useLogin({
    setFieldError: (field, message) =>
      loginForm.setError(field as keyof LoginFormValues, { message }),
  });

  const registerMutation = useRegister({
    setFieldError: (field, message) =>
      registerForm.setError(field as keyof RegisterFormValues, { message }),
  });

  const pending = isLogin ? loginMutation.isPending : registerMutation.isPending;
  const rootError = isLogin ? loginMutation.error : registerMutation.error;

  function onLoginSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  function onRegisterSubmit(values: RegisterFormValues) {
    registerMutation.mutate(values);
  }

  if (isLogin) {
    const { register, handleSubmit, formState } = loginForm;

    return (
      <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-6">
        <FieldGroup>
          <Field data-invalid={!!formState.errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!formState.errors.email}
              {...register("email")}
            />
            <FieldError errors={[formState.errors.email]} />
          </Field>

          <Field data-invalid={!!formState.errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={!!formState.errors.password}
              {...register("password")}
            />
            <FieldError errors={[formState.errors.password]} />
          </Field>
        </FieldGroup>

        {rootError && (
          <Alert variant="destructive">
            <AlertDescription>
              {rootError instanceof Error ? rootError.message : "Unable to sign in"}
            </AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Spinner />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    );
  }

  const { register, handleSubmit, formState } = registerForm;

  return (
    <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-6">
      <FieldGroup>
        <Field data-invalid={!!formState.errors.displayName}>
          <FieldLabel htmlFor="displayName">Display name</FieldLabel>
          <Input
            id="displayName"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={!!formState.errors.displayName}
            {...register("displayName")}
          />
          <FieldError errors={[formState.errors.displayName]} />
        </Field>

        <Field data-invalid={!!formState.errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!formState.errors.email}
            {...register("email")}
          />
          <FieldError errors={[formState.errors.email]} />
        </Field>

        <Field data-invalid={!!formState.errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            aria-invalid={!!formState.errors.password}
            {...register("password")}
          />
          <FieldError errors={[formState.errors.password]} />
        </Field>
      </FieldGroup>

      {rootError && (
        <Alert variant="destructive">
          <AlertDescription>
            {rootError instanceof Error ? rootError.message : "Unable to create account"}
          </AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Spinner />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
