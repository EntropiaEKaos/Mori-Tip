"use client";
import { Composer } from "@/components/composer";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

export default function ComposePage() {
  const { me, loading } = useAuth();
  const router = useRouter();
  if (loading) return <p className="text-slate-500 text-sm p-4">Carregando...</p>;
  if (!me) {
    router.push("/login");
    return null;
  }
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold px-1">Nova publicação</h1>
      <Composer onPosted={() => router.push("/feed")} />
    </div>
  );
}
