import { cn, initials } from "@/lib/utils";

export function Avatar({
  src,
  name,
  size = 40,
  className,
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size, fontSize: Math.max(11, size / 2.6) };
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={style}
        className={cn("rounded-full object-cover border border-slate-200 bg-slate-200", className)}
      />
    );
  }
  const hue = Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 360;
  return (
    <div
      style={{ ...style, background: `hsl(${hue}, 65%, 55%)` }}
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white shrink-0",
        className,
      )}
    >
      {initials(name) || "?"}
    </div>
  );
}
