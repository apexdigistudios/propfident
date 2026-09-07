"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropMatchWorkspace from "@/components/prop-match/PropMatchWorkspace";

export default function FirmFitClient() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    void createClient().auth.getUser().then(({ data }) => {
      if (data.user) router.replace("/dashboard/tools/prop-match");
      else setAuthenticated(false);
    });
  }, [router]);

  if (authenticated !== false) return null;

  return (
    <>
      <Navbar />
      <PropMatchWorkspace />
      <Footer />
    </>
  );
}
