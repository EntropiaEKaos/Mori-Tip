"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";

type Badge = {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  morisReward: number;
  owned: boolean;
  earnedAt: string | null;
};

type Data = {
  xp: number;
  level: number;
  moris: number;
  credits: number;
  isPremium: boolean;
  progress: { current: number; needed: number; percent: number };
  badges: Badge[];
};

export default function GamificationPage() {
  const { me, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!me) router.push("/login");
    else {
      fetch("/api/gamification").then(async (r) => {
        if (r.ok) setData(await r.json());
      });
    }
  }, [me, loading, router]);

  if (!data) return <p className="p-4 text-sm text-[#8a826a]">Carregando progressão...</p>;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#0f0f11] to-[#1a1815] text-[#fdf5d8] rounded-2xl p-6 border border-[#c5a84a]/20">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="text-[#c5a84a]" />
          <div>
            <h1 className="text-xl font-extrabold">Nível {data.level}</h1>
            <p className="text-xs text-[#b8b0a6]">{data.xp} XP total · {data.moris} Moris</p>
          </div>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#c5a84a] to-[#9b8038]" style={{ width: `${data.progress.percent}%` }} />
        </div>
        <p className="text-[11px] text-[#b8b0a6] mt-2">
          {data.progress.current}/{data.progress.needed} XP para o próximo nível
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#eae3ce] p-4">
        <h2 className="font-extrabold mb-3">Badges & brindes</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {data.badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-xl border p-3 flex gap-3 ${
                b.owned ? "border-[#c5a84a] bg-[#fdfaf4]" : "border-[#eae3ce] opacity-70"
              }`}
            >
              <div className="text-3xl">{b.icon}</div>
              <div className="min-w-0">
                <div className="font-extrabold text-sm flex items-center gap-1">
                  {b.name}
                  {b.owned && <span className="text-[10px] bg-[#c5a84a] text-[#0f0f11] px-1.5 rounded-full">OK</span>}
                </div>
                <p className="text-xs text-[#5c5648] mt-0.5">{b.description}</p>
                <p className="text-[10px] text-[#a89f80] mt-1">
                  +{b.xpReward} XP · +{b.morisReward} Moris
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
