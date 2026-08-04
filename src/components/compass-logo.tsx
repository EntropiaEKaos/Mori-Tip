export function CompassLogo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Bússola Mori"
    >
      {/* Círculo externo dourado */}
      <circle cx="32" cy="32" r="30" stroke="#c5a84a" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="26" stroke="#c5a84a" strokeWidth="1" strokeDasharray="3 3" />
      {/* Bússola interna */}
      <g>
        {/* Norte (agulha dourada) */}
        <polygon points="32,8 34.5,24 31.5,24" fill="#c5a84a" />
        <polygon points="32,56 30.5,40 33.5,40" fill="#0f0f11" />
        {/* Leste */}
        <polygon points="56,32 40,34.5 40,31.5" fill="#c5a84a" />
        {/* Oeste */}
        <polygon points="8,32 24,29.5 24,34.5" fill="#0f0f11" />
        {/* Sul (detalhe preto) */}
        <polygon points="32,56 30.5,40 33.5,40" fill="#0f0f11" stroke="#c5a84a" strokeWidth="0.8" />
        {/* Centro */}
        <circle cx="32" cy="32" r="3.5" fill="#0f0f11" stroke="#c5a84a" strokeWidth="1.2" />
      </g>
      {/* Pontos cardeais mini */}
      <text x="32" y="5" textAnchor="middle" fontSize="3.5" fill="#c5a84a" fontWeight="bold" letterSpacing="0.4">N</text>
      <text x="59" y="33" textAnchor="middle" fontSize="3.5" fill="#c5a84a" fontWeight="bold">E</text>
      <text x="5" y="33" textAnchor="middle" fontSize="3.5" fill="#0f0f11" fontWeight="bold">O</text>
      <text x="32" y="62" textAnchor="middle" fontSize="3.5" fill="#0f0f11" fontWeight="bold">S</text>
    </svg>
  );
}
