import Image from "next/image";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink">
      {/* Full-bleed background — client replaced the butterfly-jewellery
          banner with a new diamond-halo-ring-in-a-box shot on navy velvet
          (Sep 2026), saved over these same filenames so only alt text +
          object-position needed updating. Swaps to the portrait crop below
          the sm breakpoint. A soft radial vignette (not a hard rectangle)
          darkens the centre just enough for the form to read, so it never
          looks like a "card" dropped on the photo. */}
      <div className="absolute inset-0">
        <Image
          src="/images/auth-visual-desktop.jpg"
          alt="NORVIK JEWELS diamond halo ring"
          fill
          priority
          // Ring sits roughly x 68-88%, y 37-58% in this landscape crop
          // (measured by locating the brightest/whitest cluster — the
          // diamonds — plus the gold band). Biasing the crop there keeps it
          // in frame on both ultrawide (crops top/bottom) and narrower
          // desktop windows (crops left/right).
          className="hidden object-cover object-[76%_46%] sm:block"
          sizes="100vw"
        />
        <Image
          src="/images/auth-visual-mobile.jpg"
          alt="NORVIK JEWELS diamond halo ring"
          fill
          priority
          // Ring sits roughly x 55-89%, y 50-61% in this portrait crop. On
          // tall/narrow phones object-cover crops from the sides — biasing
          // right keeps the ring fully in frame instead of a centered crop
          // trimming it out.
          className="object-cover object-[69%_55%] sm:hidden"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_50%,rgba(5,8,18,0.85)_0%,rgba(5,8,18,0.6)_55%,rgba(5,8,18,0.2)_100%)]" />
      </div>

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
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
