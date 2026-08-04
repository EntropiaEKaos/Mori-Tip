import { db } from "@/db";
import { inns, guides, itineraries } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq, ilike, or } from "drizzle-orm";

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await getCurrentUser();
    const { prompt } = await req.json();
    if (!prompt) throw new Error("Mensagem vazia");

    const query = String(prompt).toLowerCase();

    // 1. Scan DB for relevant recommendations
    let foundInns = [] as any[];
    let foundGuides = [] as any[];
    let foundItineraries = [] as any[];

    if (query.includes("pousada") || query.includes("quarto") || query.includes("hosped") || query.includes("hotel")) {
      foundInns = await db
        .select()
        .from(inns)
        .where(or(ilike(inns.name, `%${query}%`), ilike(inns.city, `%${query}%`)))
        .limit(3);
    }
    if (query.includes("guia") || query.includes("passeio") || query.includes("tour")) {
      foundGuides = await db
        .select()
        .from(guides)
        .where(or(ilike(guides.headline, `%${query}%`), ilike(guides.city, `%${query}%`)))
        .limit(3);
    }
    if (query.includes("roteiro") || query.includes("itiner") || query.includes("viajar")) {
      foundItineraries = await db
        .select()
        .from(itineraries)
        .where(or(ilike(itineraries.title, `%${query}%`), ilike(itineraries.city, `%${query}%`)))
        .limit(3);
    }

    // Fallbacks if nothing targeted
    if (foundInns.length === 0 && foundGuides.length === 0 && foundItineraries.length === 0) {
      foundInns = await db.select().from(inns).limit(2);
      foundGuides = await db.select().from(guides).limit(1);
    }

    // 2. Generate Beautiful AI Answer
    let aiResponse = "";
    if (query.includes("olá") || query.includes("oi") || query.includes("bom dia") || query.includes("boa tarde")) {
      aiResponse = `Olá, ${me?.displayName || "viajante"}! Sou o **Mori Concierge 🧭**, o seu assistente de viagem inteligente na rede Mori. Posso te ajudar a encontrar as melhores pousadas, roteiros de viagem e guias locais credenciados. \n\nO que você está planejando para a sua próxima aventura?`;
    } else {
      aiResponse = `Com base nas suas preferências, fiz uma busca profunda na rede Mori e montei algumas sugestões incríveis para você!\n\n`;

      if (foundInns.length > 0) {
        aiResponse += `### 🏨 Pousadas em Destaque:\n`;
        foundInns.forEach((inn) => {
          aiResponse += `- **${inn.name}** em *${inn.city}, ${inn.state}*: Diárias a partir de **R$ ${inn.pricePerNight}**. Possui comodidades como: ${inn.amenities?.join(", ") || "Wi-Fi"}.\n`;
        });
        aiResponse += `\n`;
      }

      if (foundGuides.length > 0) {
        aiResponse += `### 🗺️ Guias Locais Recomendados:\n`;
        foundGuides.forEach((g) => {
          aiResponse += `- **Guia credenciado** em *${g.city}, ${g.state}*: Especialista em *${g.specialties?.join(", ") || "Aventura"}*. Valor do serviço por dia: **R$ ${g.pricePerDay}**.\n`;
        });
        aiResponse += `\n`;
      }

      if (foundItineraries.length > 0) {
        aiResponse += `### 🧭 Roteiros Prontos para Seguir:\n`;
        foundItineraries.forEach((it) => {
          aiResponse += `- **${it.title}** (${it.days} dias): Orçamento estimado em R$ ${it.budget}. Passa por *${it.city}*.\n`;
        });
        aiResponse += `\n`;
      }

      aiResponse += `*Dica Mori:* Lembre-se que você pode reservar qualquer pousada parceira diretamente utilizando seus **Moris** para obter descontos exclusivos se assinar a nossa conta **Premium**!`;
    }

    return {
      message: aiResponse,
      inns: foundInns,
      guides: foundGuides,
      itineraries: foundItineraries,
    };
  });
}
