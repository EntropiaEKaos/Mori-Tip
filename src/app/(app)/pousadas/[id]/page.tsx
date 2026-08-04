"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Star, CalendarCheck, Crown, Wifi, Coffee, Waves, Flame } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { ReviewsSection } from "@/components/reviews-section";
import { useAuth } from "@/components/auth-provider";
import { PostCard, type FeedPost } from "@/components/post-card";

type Inn = {
  id: number;
  name: string;
  description: string;
  city: string;
  state: string;
  country: string;
  coverUrl: string | null;
  pricePerNight: number;
  rating: number;
  amenities: string[];
  acceptsBookings: boolean;
  totalBookings: number;
  ownerUsername: string;
  ownerDisplayName: string;
  ownerAvatar: string | null;
  ownerIsPremium: boolean;
};

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "Wi-Fi": <Wifi size={14} />,
  "Café da manhã": <Coffee size={14} />,
  "Piscina": <Waves size={14} />,
  "Lareira": <Flame size={14} />,
};

export default function InnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { me } = useAuth();
  const [inn, setInn] = useState<Inn | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [booking, setBooking] = useState(false);
  const [bookForm, setBookForm] = useState({ checkIn: "", checkOut: "", guests: "2", useMoris: "0" });

  useEffect(() => {
    fetch(`/api/inns/${id}`).then(async (r) => {
      if (r.ok) setInn(await r.json());
    });
    fetch(`/api/posts?authorId=${id}`).then(async (r) => {
      if (r.ok) setPosts(await r.json());
    });
  }, [id]);

  if (!inn) return <p className="p-4 text-sm text-[#8a826a]">Carregando...</p>;

  async function book(e: React.FormEvent) {
    e.preventDefault();
    if (!me?.isPremium) {
      if (confirm("Reservas exigem Premium. Ir para assinatura?")) window.location.href = "/premium";
      return;
    }
    const r = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ innId: inn!.id, ...bookForm, useMoris: Number(bookForm.useMoris) || 0 }),
    });
    const d = await r.json();
    if (!r.ok) return alert(d.error || "Erro");
    alert("Reserva solicitada!");
    setBooking(false);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#e8e2d4] rounded-3xl overflow-hidden">
        <div className="h-64 bg-gradient-to-br from-[#0f0f11] via-[#1a1815] to-[#9b8038] relative">
          <Link href="/pousadas" className="absolute top-5 left-5 p-2 rounded-full bg-black/30 backdrop-blur text-white">
            <ArrowLeft size={18} />
          </Link>
          {inn.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={inn.coverUrl} alt={inn.name} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/40 text-6xl font-serif">M</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-3xl font-extrabold tracking-[-1.5px]">{inn.name}</h1>
              <p className="text-sm text-[#8a826a] flex items-center gap-1 mt-1">
                <MapPin size={12} /> {inn.city}, {inn.state}, {inn.country}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-[#0f0f11]">R$ {inn.pricePerNight}</div>
              <div className="text-xs text-[#8a826a]">/noite</div>
            </div>
          </div>

          {inn.rating > 0 && (
            <div className="flex items-center gap-1.5 mt-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} className={s <= inn.rating ? "text-[#c5a84a] fill-[#c5a84a]" : "text-[#e8e2d4]"} />
              ))}
              <span className="text-xs text-[#8a826a] ml-1.5">{inn.totalBookings} estadias</span>
            </div>
          )}

          <p className="text-sm text-[#1a1815] mt-4 leading-relaxed">{inn.description}</p>

          {inn.amenities.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-extrabold tracking-[1.5px] text-[#8a826a] mb-2">COMODIDADES</h3>
              <div className="flex flex-wrap gap-2">
                {inn.amenities.map((a) => (
                  <span key={a} className="flex items-center gap-1.5 text-xs bg-[#fdfaf4] border border-[#e8e2d4] px-3 py-1.5 rounded-full">
                    {AMENITY_ICONS[a] ?? <span>•</span>} {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center gap-2 p-3 bg-[#fdfaf4] border border-[#e8e2d4] rounded-2xl">
            <Avatar src={inn.ownerAvatar} name={inn.ownerDisplayName} size={36} />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[#8a826a]">Anfitrião</div>
              <div className="text-sm font-bold flex items-center gap-1">
                {inn.ownerDisplayName}
                {inn.ownerIsPremium && <Crown size={12} className="text-[#c5a84a]" />}
              </div>
            </div>
            <Link href={`/u/${inn.ownerUsername}`} className="text-xs font-bold border border-[#e8e2d4] px-3 py-1.5 rounded-full hover:border-[#c5a84a]">
              Ver perfil
            </Link>
          </div>

          <button
            onClick={() => setBooking(true)}
            className="mt-5 w-full bg-[#0f0f11] text-[#c5a84a] rounded-2xl py-3.5 font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-[#1a1815] transition shadow-[0_4px_18px_rgba(15,15,17,0.15)]"
          >
            <CalendarCheck size={16} /> Reservar estadia
          </button>
        </div>
      </div>

      <ReviewsSection targetType="inn" targetId={inn.id} canReview={Boolean(me)} />

      {posts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold tracking-[-0.5px]">Posts da pousada</h3>
          {posts.map((p) => (
            <PostCard key={p.id} post={p} onChange={() => {}} />
          ))}
        </div>
      )}

      {booking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4">
          <form onSubmit={book} className="bg-white rounded-3xl w-full max-w-md p-6 border border-[#e8e2d4] space-y-3">
            <h3 className="font-extrabold text-lg">Reservar · {inn.name}</h3>
            {!me?.isPremium && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
                <Crown size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <span>Reservas exigem conta Premium. Você será redirecionado.</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-[#8a826a]">Check-in
                <input type="date" required value={bookForm.checkIn} onChange={(e) => setBookForm({ ...bookForm, checkIn: e.target.value })} className="mt-1 w-full bg-[#fdfaf4] border border-[#e8e2d4] rounded-xl px-3 py-2 text-sm" />
              </label>
              <label className="text-xs text-[#8a826a]">Check-out
                <input type="date" required value={bookForm.checkOut} onChange={(e) => setBookForm({ ...bookForm, checkOut: e.target.value })} className="mt-1 w-full bg-[#fdfaf4] border border-[#e8e2d4] rounded-xl px-3 py-2 text-sm" />
              </label>
            </div>
            <input type="number" min={1} value={bookForm.guests} onChange={(e) => setBookForm({ ...bookForm, guests: e.target.value })} placeholder="Hóspedes" className="w-full bg-[#fdfaf4] border border-[#e8e2d4] rounded-xl px-3 py-2 text-sm" />
            <input type="number" min={0} value={bookForm.useMoris} onChange={(e) => setBookForm({ ...bookForm, useMoris: e.target.value })} placeholder={`Usar Moris (saldo ${me?.moris ?? 0})`} className="w-full bg-[#fdfaf4] border border-[#e8e2d4] rounded-xl px-3 py-2 text-sm" />
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setBooking(false)} className="flex-1 border border-[#e8e2d4] rounded-xl py-2.5 text-sm font-bold">Cancelar</button>
              <button type="submit" className="flex-1 bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] rounded-xl py-2.5 text-sm font-extrabold">Confirmar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
