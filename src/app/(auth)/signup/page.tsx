"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, Mail } from "lucide-react";
import { sendOtp, verifyOtp, type AuthState } from "../actions";
import Link from "next/link";

const initialState: AuthState = { error: null, step: "email" };

export default function SignupPage() {
  const [stateSend, formActionSend, isPendingSend] = useActionState(sendOtp, initialState);
  const [stateVerify, formActionVerify, isPendingVerify] = useActionState(verifyOtp, stateSend);

  // Derive the active state
  const currentState = stateVerify.step === "otp" ? stateVerify : stateSend;
  const isOtpStep = currentState.step === "otp";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">Create an account</CardTitle>
          <CardDescription>
            {isOtpStep 
              ? "We've sent a 6-digit code to your email to verify your account." 
              : "Join the community to report and verify infrastructure issues."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isOtpStep ? (
            <form action={formActionSend} className="grid gap-4">
              {currentState?.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{currentState.error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input 
                  id="full_name" 
                  name="full_name" 
                  placeholder="John Doe" 
                  required 
                  disabled={isPendingSend}
                  className="focus-visible:ring-primary"
                  defaultValue={currentState.fullName || ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  disabled={isPendingSend}
                  className="focus-visible:ring-primary"
                  defaultValue={currentState.email || ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  disabled={isPendingSend}
                  className="focus-visible:ring-primary"
                  defaultValue={currentState.password || ""}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPendingSend}>
                {isPendingSend ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Verification Code
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form action={formActionVerify} className="grid gap-4">
              {currentState?.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{currentState.error}</AlertDescription>
                </Alert>
              )}
              
              {/* Hidden inputs to pass data to verify step */}
              <input type="hidden" name="email" value={currentState.email || ""} />
              <input type="hidden" name="full_name" value={currentState.fullName || ""} />
              <input type="hidden" name="password" value={currentState.password || ""} />

              <div className="grid gap-2">
                <Label htmlFor="code">6-Digit Code</Label>
                <Input 
                  id="code" 
                  name="code" 
                  type="text" 
                  placeholder="123456" 
                  required 
                  maxLength={6}
                  disabled={isPendingVerify}
                  className="focus-visible:ring-primary text-center tracking-widest font-mono text-lg"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPendingVerify}>
                {isPendingVerify ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Create Account"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
