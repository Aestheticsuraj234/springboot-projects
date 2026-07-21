import { AuthForm } from "@/components/auth-form";
import { CardDescription, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <CardTitle className="text-lg">Create account</CardTitle>
        <CardDescription>Start organizing your photos in one place</CardDescription>
      </div>
      <AuthForm mode="register" />
    </div>
  );
}
