"use server";

import bcrypt from "bcrypt";
import connectDB from "@/lib/mongodb";
import { User } from "@/lib/models/user";
import { createSession, deleteSession, getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface AuthResult {
  success: boolean;
  error?: string;
}

export async function signUp(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    // Validate input
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    if (password.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters",
      };
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
    });

    // Create session
    await createSession(user.id, user.email);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Sign up error:", error);
    return { success: false, error: "An error occurred during sign up" };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    // Validate input
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    await connectDB();

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return { success: false, error: "Invalid credentials" };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return { success: false, error: "Invalid credentials" };
    }

    // Create session
    await createSession(user.id, user.email);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, error: "An error occurred during sign in" };
  }
}

export async function signOut() {
  await deleteSession();
  revalidatePath("/");
  redirect("/");
}

export async function getUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  try {
    await connectDB();

    const user = await User.findById(session.userId).select(
      "id email createdAt"
    );

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}
