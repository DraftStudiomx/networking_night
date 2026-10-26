import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { config, need } from "./config";
import { db } from "./db";

export type Role = "admin" | "staff";
export type StaffUser = { email: string; role: Role };

/** Supabase client bound to the request cookies (anon key + the signed-in user's session). */
export async function authClient() {
  const store = await cookies();
  return createServerClient(
    need(config.supabaseUrl, "Supabase"),
    need(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "Supabase"),
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          // read-only in Server Components; route handlers and actions can write
          try {
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {}
        },
      },
    },
  );
}

/** The signed-in organizer, or null when signed out or not on the staff list. */
export async function currentStaff(): Promise<StaffUser | null> {
  if (!config.supabaseUrl || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  const { data } = await (await authClient()).auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email) return null;
  const { data: row } = await db().from("staff").select("email, role").eq("email", email).maybeSingle();
  return row ? (row as StaffUser) : null;
}

/** Guards a page: admins pass everywhere, staff only where `role` is "staff". */
export async function requireStaff(role: Role, next: string): Promise<StaffUser> {
  const user = await currentStaff();
  if (!user) redirect(`/acceso?next=${encodeURIComponent(next)}`);
  if (role === "admin" && user.role !== "admin") redirect("/staff");
  return user;
}

export async function isAllowedEmail(email: string) {
  const { data } = await db().from("staff").select("email").eq("email", email.toLowerCase()).maybeSingle();
  return !!data;
}
