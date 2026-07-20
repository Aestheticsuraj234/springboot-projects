"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useLoginMutation } from "@/hooks/use-auth";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";

export function LoginForm() {
  const loginMutation = useLoginMutation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    loginMutation.mutate(values);
  });

  return (
    <AuthCard
      title="Sign in"
      description="Enter your email and password to access your account."
      footer={
        <>
          Don&apos;t have an account? <AuthLink href="/register">Sign up</AuthLink>
        </>
      }
    >
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!form.formState.errors.email}
              {...form.register("email")}
            />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>

          <Field data-invalid={!!form.formState.errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={!!form.formState.errors.password}
              {...form.register("password")}
            />
            <FieldError errors={[form.formState.errors.password]} />
          </Field>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Spinner />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
