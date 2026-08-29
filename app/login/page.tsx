import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Visual panel — product photography */}
      <div className="relative hidden bg-ink lg:block">
        <Image
          src="/images/login-visual-desktop.jpg"
          alt="NORVIK JEWELS diamond halo ring"
          fill
          priority
          className="object-cover opacity-95"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/10" />
        <div className="absolute inset-0 flex flex-col justify-between p-14">
          <Link href="/" className="inline-block w-fit">
            <Image
              src="/images/logo-mark-jewels.png"
              alt="NORVIK JEWELS"
              width={56}
              height={56}
              className="h-16 w-auto"
            />
          </Link>
          <blockquote className="font-display text-[38px] font-medium leading-[1.08] tracking-[-0.01em] text-white">
            Jewellery is worn every day.
            <br />
            It should be made for exactly that.
          </blockquote>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-ivory px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex flex-col items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo-full-jewels-light.png"
                alt="Norvik Jewels"
                width={280}
                height={93}
                className="h-10 w-auto sm:h-11"
              />
            </Link>
          </div>

          <Suspense fallback={null}>
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
