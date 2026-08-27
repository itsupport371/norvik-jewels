import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Visual panel — product photography */}
      <div className="relative hidden bg-ink lg:block">
        <Image
          src="/images/product-earring-1.jpg"
          alt="NORVIK JEWELS floral diamond earring"
          fill
          priority
          className="object-cover opacity-95"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/10" />
        <div className="absolute inset-0 flex flex-col justify-between p-14">
          <Link href="/" className="inline-block w-fit">
            <Image
              src="/images/logo-mark-new.png"
              alt="NORVIK JEWELS"
              width={56}
              height={56}
              className="h-16 w-auto"
            />
          </Link>
          <blockquote className="font-display text-3xl font-light leading-snug text-white">
            An account remembers your
            <br />
            sizes, your addresses, your story.
          </blockquote>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-ivory px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex flex-col items-center">
            <Link href="/" className="rounded-md bg-ink px-8 py-4">
              <Image
                src="/images/logo-full-new.png"
                alt="NORVIK JEWELS"
                width={280}
                height={93}
                className="h-12 w-auto"
              />
            </Link>
          </div>

          <Suspense fallback={null}>
            <AuthForm mode="signup" />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
