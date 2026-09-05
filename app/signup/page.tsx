import Image from "next/image";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink">
      {/* Full-bleed background — the client's ring banner covers the whole
          screen. Swaps to the portrait crop below the sm breakpoint. A soft
          radial vignette (not a hard rectangle) darkens the centre just
          enough for the form to read, so it never looks like a "card"
          dropped on the photo. */}
      <div className="absolute inset-0">
        <Image
          src="/images/auth-visual-desktop.jpg"
          alt="NORVIK JEWELS diamond halo ring"
          fill
          priority
          className="hidden object-cover sm:block"
          sizes="100vw"
        />
        <Image
          src="/images/auth-visual-mobile.jpg"
          alt="NORVIK JEWELS diamond halo ring"
          fill
          priority
          className="object-cover sm:hidden"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_50%,rgba(5,8,18,0.85)_0%,rgba(5,8,18,0.6)_55%,rgba(5,8,18,0.2)_100%)]" />
      </div>

      {/* Brand quote — desktop only, bottom-left, well clear of the form */}
      <blockquote className="absolute bottom-10 left-10 z-10 hidden max-w-md font-display text-[26px] font-medium leading-[1.1] tracking-[-0.01em] text-white/90 lg:block">
        An account remembers your
        <br />
        sizes, your addresses, your story.
      </blockquote>

      {/* Form — sits directly on the photo, no card, no border, no shadow */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-14">
        <div className="w-full max-w-[360px]">
          <div className="mb-5 flex justify-center">
            <Image
              src="/images/logo-mark-new.png"
              alt="NORVIK JEWELS"
              width={72}
              height={72}
              className="h-12 w-auto"
            />
          </div>

          <Suspense fallback={null}>
            <AuthForm mode="signup" />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
