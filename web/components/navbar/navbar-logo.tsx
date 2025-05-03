import Link from "next/link";
import Image from "next/image";

export function NavbarLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Image src="/logo.webp" alt="FounderSignal Logo" width={80} height={80} />
    </Link>
  );
}
