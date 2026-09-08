import { redirect } from "next/navigation";

export default function JobsRedirectPage() {
  redirect("/events?tab=activations");
}
