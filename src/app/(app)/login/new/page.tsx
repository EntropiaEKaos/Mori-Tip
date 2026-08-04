"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

export default function PostLoginRedirect() {
  const { me, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!me) {
      router.replace("/login");
      return;
    }
    if (!me.hasChosenRole) {
      router.replace("/onboarding");
    } else {
      router.replace("/feed");
    }
  }, [me, loading, router]);

  return (
    <div className="min-h-[80vh] grid place-items-center">
      <p className="text-sm text-[#8a826a]">Configurando sua jornada...</p>
    </div>
  );
}
