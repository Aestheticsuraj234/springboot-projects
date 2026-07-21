import { AuthForm } from "@/components/auth-form";
import { CardDescription, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <CardTitle className="text-lg">Sign in</CardTitle>
        <CardDescription>Enter your credentials to continue</CardDescription>
      </div>
      <AuthForm mode="login" />
    </div>
  );
}
