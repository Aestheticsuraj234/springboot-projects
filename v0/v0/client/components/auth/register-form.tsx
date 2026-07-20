"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useRegisterMutation } from "@/hooks/use-auth";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";

export function RegisterForm() {
  const registerMutation = useRegisterMutation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    registerMutation.mutate(values);
  });

  return (
    <AuthCard
      title="Create an account"
      description="Fill in your details to get started."
      footer={
        <>
          Already have an account? <AuthLink href="/login">Sign in</AuthLink>
        </>
      }
    >
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.username}>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="johndoe"
              aria-invalid={!!form.formState.errors.username}
              {...form.register("username")}
            />
            <FieldDescription>
              Must be between 3 and 50 characters.
            </FieldDescription>
            <FieldError errors={[form.formState.errors.username]} />
          </Field>

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
              autoComplete="new-password"
              placeholder="Create a password"
              aria-invalid={!!form.formState.errors.password}
              {...form.register("password")}
            />
            <FieldDescription>Must be at least 8 characters.</FieldDescription>
            <FieldError errors={[form.formState.errors.password]} />
          </Field>

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <>
                <Spinner />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
