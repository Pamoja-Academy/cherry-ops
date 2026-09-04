import { redirect } from "next/navigation";

/** Always open on login — never skip straight into the CRM from the root URL. */
export default function Home() {
  redirect("/login");
}
