import { getCurrentUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";

export async function GET() {
  return handleApi(async () => {
    const user = await getCurrentUser();
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      coverUrl: user.coverUrl,
      location: user.location,
      role: user.role,
      hasChosenRole: user.hasChosenRole,
      isVerified: user.isVerified,
      isPremium: user.isPremium,
      premiumUntil: user.premiumUntil,
      xp: user.xp,
      level: user.level,
      moris: user.moris,
      credits: user.credits,
    };
  });
}
