"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import nodemailer from "nodemailer";
import { encrypt } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export interface AuthState {
  error: string | null;
  step?: "email" | "otp";
  email?: string;
  fullName?: string;
  password?: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// LOGIN ACTION (No OTP, just password)
export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from("profiles")
    .select("id, role, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (error || !user || !user.password_hash) {
    return { error: "Invalid email or password." };
  }

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    return { error: "Invalid email or password." };
  }

  // Set Custom JWT Session
  const sessionToken = await encrypt({
    user: { id: user.id, email, role: user.role },
  });

  const cookieStore = await cookies();
  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// SIGNUP STEP 1: Send OTP
export async function sendOtp(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string;
  const fullName = formData.get("full_name") as string;
  const password = formData.get("password") as string;

  if (!email || !fullName || !password) {
    return { error: "All fields are required.", step: "email" };
  }

  const supabase = await createClient();

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingUser) {
    return { error: "An account with this email already exists.", step: "email" };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

  // Store OTP
  const { error: dbError } = await supabase
    .from("otps")
    .upsert({ email, code, expires_at: expiresAt });

  if (dbError) {
    console.error("DB Error storing OTP", dbError);
    return { error: "Failed to generate OTP. Please try again.", step: "email" };
  }

  try {
    await transporter.sendMail({
      from: `"ResoluCity" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your ResoluCity Verification Code",
      text: `Your verification code is: ${code}\nThis code expires in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-w: 400px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">ResoluCity</h2>
          <p style="color: #475569;">Here is your verification code to create your account. It expires in 10 minutes.</p>
          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0f172a;">
            ${code}
          </div>
        </div>
      `,
    });
  } catch (err: any) {
    console.error("Nodemailer error:", err);
    return { error: "Failed to send email. Check SMTP settings.", step: "email" };
  }

  return { error: null, step: "otp", email, fullName, password };
}

// SIGNUP STEP 2: Verify OTP and create user
export async function verifyOtp(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string;
  const fullName = formData.get("full_name") as string;
  const password = formData.get("password") as string;
  const code = formData.get("code") as string;

  if (!email || !code || !password || !fullName) {
    return { error: "Code is required.", step: "otp", email, fullName, password };
  }

  const supabase = await createClient();

  // Verify OTP
  const { data: otpRecord, error: otpError } = await supabase
    .from("otps")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (otpError || !otpRecord || otpRecord.code !== code) {
    return { error: "Invalid code. Please try again.", step: "otp", email, fullName, password };
  }

  if (new Date(otpRecord.expires_at) < new Date()) {
    return { error: "Code expired. Please request a new one.", step: "email" };
  }

  // Delete used OTP
  await supabase.from("otps").delete().eq("email", email);

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const { data: newUser, error: insertError } = await supabase
    .from("profiles")
    .insert({
      email,
      full_name: fullName,
      password_hash: passwordHash,
      role: "citizen"
    })
    .select("id")
    .single();
    
  if (insertError) {
    console.error("Profile creation error:", insertError);
    return { error: "Failed to create user profile. It may already exist.", step: "email" };
  }

  // Set Custom JWT Session
  const sessionToken = await encrypt({
    user: { id: newUser.id, email, role: "citizen" },
  });

  const cookieStore = await cookies();
  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}
