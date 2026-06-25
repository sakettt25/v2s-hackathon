"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { login, type AuthState } from "../actions";
import Link from "next/link";

const initialState: AuthState = { error: null };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">Login</CardTitle>
          <CardDescription>
            Enter your email and password to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form action={formAction} className="grid gap-4">
            {state?.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                disabled={isPending}
                className="focus-visible:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                disabled={isPending}
                className="focus-visible:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
