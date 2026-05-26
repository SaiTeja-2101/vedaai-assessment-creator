import { redirect } from "next/navigation";

// The app opens on the Assignments screen.
export default function Home() {
  redirect("/assignments");
}
