import { db } from "@/db";
import {
  users,
  posts,
  inns,
  restaurants,
  follows,
  creditPackages,
  products,
  itineraries,
  guides,
  badges,
  verificationRequests,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { DEFAULT_BADGES, ensureBadgesSeeded } from "@/lib/gamification";
import { sql } from "drizzle-orm";

export async function POST() {
  return handleApi(async () => {
    const [{ c }] = await db.select({ c: sql<number>`count(*)::int` }).from(users);
    if (c > 0) {
      await ensureBadgesSeeded();
      const pkgs = await db.select().from(creditPackages).limit(1);
      if (!pkgs.length) {
        await db.insert(creditPackages).values([
          { name: "Starter", credits: 50, priceMoris: 100, bonusCredits: 0 },
          { name: "Boost", credits: 150, priceMoris: 250, bonusCredits: 20 },
          { name: "Pro", credits: 400, priceMoris: 600, bonusCredits: 80 },
          { name: "Agency", credits: 1000, priceMoris: 1200, bonusCredits: 300 },
        ]);
      }
      return { ok: true, skipped: true, users: c };
    }

    await ensureBadgesSeeded();

    const pwd = await hashPassword("admin123");
    const [admin] = await db
      .insert(users)
      .values({
        username: "admin",
        email: "admin@mori.app",
        passwordHash: pwd,
        displayName: "Administração Mori",
        role: "admin",
        isVerified: true,
        isPremium: true,
        bio: "Equipe oficial da rede Mori ✈️",
        location: "Brasil",
        moris: 10000,
        credits: 500,
        xp: 500,
        level: 5,
      })
      .returning();

    const guestPwd = await hashPassword("mori123");
    const seedUsers = [
      { username: "marina", displayName: "Marina Serrano", bio: "Viajo em busca de mar 🌊", location: "Florianópolis, SC", role: "user" as const, isPremium: true, moris: 800 },
      { username: "pousada_do_sol", displayName: "Pousada do Sol", bio: "Sua casa em Jericoacoara 🌅", location: "Jericoacoara, CE", role: "host" as const, isVerified: true, isPremium: true, moris: 2000 },
      { username: "rafaelmochila", displayName: "Rafael Andrade", bio: "Mochileiro fotográfico 📷", location: "Ouro Preto, MG", role: "user" as const, moris: 350 },
      { username: "chale_verde", displayName: "Chalé Verde Serra", bio: "Chalés na montanha em Monte Verde", location: "Monte Verde, MG", role: "host" as const, isVerified: true, isPremium: true, moris: 1500 },
      { username: "juliana_trip", displayName: "Juliana Trip", bio: "Contando o Brasil em fotos", location: "Chapada Diamantina, BA", role: "user" as const, moris: 420 },
      { username: "guia_pedro", displayName: "Pedro Guias", bio: "Guia local de Jericoacoara e litoral cearense", location: "Jericoacoara, CE", role: "guide" as const, isVerified: true, moris: 600 },
    ];

    const created = [] as { id: number; username: string }[];
    for (const u of seedUsers) {
      const [row] = await db
        .insert(users)
        .values({
          username: u.username,
          email: `${u.username}@mori.app`,
          passwordHash: guestPwd,
          displayName: u.displayName,
          bio: u.bio,
          location: u.location,
          role: u.role,
          isVerified: u.isVerified ?? false,
          isPremium: u.isPremium ?? false,
          moris: u.moris ?? 100,
          xp: 80,
          level: 2,
        })
        .returning();
      created.push({ id: row.id, username: row.username });
    }

    const host1 = created.find((u) => u.username === "pousada_do_sol")!;
    const host2 = created.find((u) => u.username === "chale_verde")!;
    const marina = created.find((u) => u.username === "marina")!;
    const rafael = created.find((u) => u.username === "rafaelmochila")!;
    const ju = created.find((u) => u.username === "juliana_trip")!;
    const pedro = created.find((u) => u.username === "guia_pedro")!;

    const [inn1] = await db
      .insert(inns)
      .values({
        ownerId: host1.id,
        name: "Pousada do Sol",
        slug: `${slugify("Pousada do Sol")}-${Date.now().toString(36)}`,
        description: "Pousada pé na areia em Jericoacoara. Café da manhã regional, redário e vista pro pôr do sol.",
        city: "Jericoacoara",
        state: "CE",
        pricePerNight: 380,
        rating: 5,
        amenities: ["Wi-Fi", "Café da manhã", "Piscina", "Pé na areia"],
        isApproved: true,
        acceptsBookings: true,
      })
      .returning();

    await db.insert(inns).values({
      ownerId: host2.id,
      name: "Chalé Verde Serra",
      slug: `${slugify("Chalé Verde Serra")}-${Date.now().toString(36)}`,
      description: "Chalés de madeira com lareira em Monte Verde. Perfeito para casais.",
      city: "Monte Verde",
      state: "MG",
      pricePerNight: 520,
      rating: 4,
      amenities: ["Lareira", "Wi-Fi", "Trilhas", "Café colonial"],
      isApproved: true,
      acceptsBookings: true,
    });

    await db.insert(posts).values([
      {
        authorId: host1.id,
        type: "photo",
        content: "Amanhecer em Jericoacoara é sempre um espetáculo 🌅 Vagas abertas para o feriado!",
        location: "Jericoacoara, CE",
        filter: "sunset",
        tags: ["jericoacoara", "praia", "nordeste"],
      },
      {
        authorId: host2.id,
        type: "tip",
        content: "Dica: no inverno a serra pede casaco e lareira. Reserve com antecedência!",
        location: "Monte Verde, MG",
        tags: ["serra", "dicas"],
      },
      {
        authorId: marina.id,
        type: "review",
        content: "Review: pousada incrível em Floripa! Café da manhã com vista pro mar 🥐🌊",
        location: "Praia Mole, SC",
        filter: "warm",
        tags: ["floripa", "review"],
      },
      {
        authorId: rafael.id,
        type: "photo",
        content: "Ouro Preto de madrugada tem uma luz diferente ⛪️",
        location: "Ouro Preto, MG",
        filter: "vintage",
        tags: ["ouropreto", "minas"],
      },
      {
        authorId: ju.id,
        type: "photo",
        content: "A Cachoeira da Fumaça vista de cima é surreal 💧✨",
        location: "Chapada Diamantina, BA",
        filter: "vivid",
        tags: ["chapada", "trilha"],
      },
    ]);

    await db.insert(follows).values([
      { followerId: marina.id, followingId: host1.id },
      { followerId: marina.id, followingId: host2.id },
      { followerId: rafael.id, followingId: host1.id },
      { followerId: ju.id, followingId: host1.id },
      { followerId: ju.id, followingId: host2.id },
      { followerId: marina.id, followingId: pedro.id },
    ]);

    await db.insert(guides).values({
      userId: pedro.id,
      headline: "Guia especializado em Jeri e dunas",
      about: "10 anos mostrando o melhor do litoral cearense. Passeios de buggy, lagoas e pôr do sol.",
      city: "Jericoacoara",
      state: "CE",
      languages: ["Português", "Inglês", "Espanhol"],
      specialties: ["Dunas", "Lagoas", "Fotografia", "Trilhas"],
      pricePerDay: 350,
      rating: 4.9,
      reviewCount: 42,
      isVerified: true,
    });

    await db.insert(itineraries).values({
      authorId: marina.id,
      title: "3 dias mágicos em Jericoacoara",
      description: "Roteiro leve com praia, lagoas e pôr do sol na Duna do Pôr do Sol.",
      city: "Jericoacoara",
      state: "CE",
      days: 3,
      budget: 1800,
      tags: ["praia", "nordeste", "casal"],
      stops: [
        { day: 1, title: "Chegada e Vila", description: "Check-in e passeio a pé pela vila", location: "Centro" },
        { day: 2, title: "Lagoa do Paraíso", description: "Dia de flutuação e redes", location: "Lagoa do Paraíso" },
        { day: 3, title: "Pôr do sol", description: "Subida na duna clássica", location: "Duna do Pôr do Sol" },
      ],
    });

    await db.insert(products).values([
      {
        sellerId: host1.id,
        innId: inn1.id,
        name: "Kit Café Jeri",
        description: "Café torrado local + bolo de milho da casa. Entrega na pousada.",
        type: "physical",
        priceMoris: 80,
        stock: 20,
        city: "Jericoacoara",
        tags: ["gastronomia", "souvenir"],
      },
      {
        sellerId: pedro.id,
        name: "Passeio de buggy (meio dia)",
        description: "Experiência com guia local pelas dunas e lagoas.",
        type: "experience",
        priceMoris: 220,
        stock: 10,
        city: "Jericoacoara",
        tags: ["passeio", "aventura"],
      },
      {
        sellerId: ju.id,
        name: "Guia PDF Chapada Diamantina",
        description: "Mapa + trilhas + dicas de hospedagem em PDF.",
        type: "digital",
        priceMoris: 45,
        stock: 999,
        city: "Chapada Diamantina",
        tags: ["digital", "trilha"],
      },
    ]);

    await db.insert(restaurants).values([
      {
        ownerId: host1.id,
        name: "Restaurante Sabores de Jeri",
        slug: `${slugify("Sabores de Jeri")}-${Date.now().toString(36)}`,
        description: "Frutos do mar frescos com vista para o pôr do sol.",
        city: "Jericoacoara",
        state: "CE",
        cuisineType: "Frutos do Mar",
        avgPrice: 90,
        rating: 4,
        amenities: ["Vista", "Ar-condicionado", "Carta de vinhos"],
        isApproved: true,
        isVerified: true,
      },
      {
        ownerId: host2.id,
        name: "Trattoria da Serra",
        slug: `${slugify("Trattoria da Serra")}-${Date.now().toString(36)}`,
        description: "Massas artesanais em ambiente aconchegante com lareira.",
        city: "Monte Verde",
        state: "MG",
        cuisineType: "Italiana",
        avgPrice: 120,
        rating: 5,
        amenities: ["Lareira", "Adega", "Terraço"],
        isApproved: true,
      },
    ]);

    await db.insert(creditPackages).values([
      { name: "Starter", credits: 50, priceMoris: 100, bonusCredits: 0 },
      { name: "Boost", credits: 150, priceMoris: 250, bonusCredits: 20 },
      { name: "Pro", credits: 400, priceMoris: 600, bonusCredits: 80 },
      { name: "Agency", credits: 1000, priceMoris: 1200, bonusCredits: 300 },
    ]);

    // silence unused
    void badges;
    void DEFAULT_BADGES;

    return {
      ok: true,
      adminEmail: admin.email,
      adminPassword: "admin123",
      demoPassword: "mori123",
    };
  });
}

export async function GET() {
  return POST();
}
