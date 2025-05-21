import Link from "next/link";

import { OptimizedImage } from "../ui/image";

export function NavbarLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <OptimizedImage
        src="/logo.webp"
        alt="FounderSignal Logo"
        width={80}
        height={80}
        priority
        quality={90}
      />
    </Link>
  );
}
