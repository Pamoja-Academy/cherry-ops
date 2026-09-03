import { auth, getRoleHome } from "@/lib/auth";
import { redirect } from "next/navigation";

/** CRM entry: signed-in → role home; guests → login. Not a marketing site. */
export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect(getRoleHome(session.user.role));
  }
  redirect("/login");
}
