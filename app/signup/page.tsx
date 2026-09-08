import Image from "next/image";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink">
      {/* Full-bleed background — the client's navy-velvet butterfly-jewellery
          banner covers the whole screen. Swaps to the portrait crop below the
          sm breakpoint. A soft radial vignette (not a hard rectangle) darkens
          the centre just enough for the form to read, so it never looks like
          a "card" dropped on the photo. */}
      <div className="absolute inset-0">
        <Image
          src="/images/auth-visual-desktop.jpg"
          alt="NORVIK JEWELS butterfly diamond earrings and ring"
          fill
          priority
          // Model sits in the right ~45% of this landscape photo, face/hands
          // around x 78%, y 35% down. The photo's own aspect (~16:9) already
          // matches most monitors, so this mainly protects ultrawide screens
          // (which crop top/bottom) from losing her face, and narrow desktop
          // windows (which crop left/right) from losing her to the left edge.
          className="hidden object-cover object-[75%_35%] sm:block"
          sizes="100vw"
        />
        <Image
          src="/images/auth-visual-mobile.jpg"
          alt="NORVIK JEWELS butterfly diamond earrings and ring"
          fill
          priority
          // Face/hands sit around x 65-75% across this portrait crop. On
          // tall/narrow phones (aspect narrower than the photo's own ~9:16)
          // object-cover crops from the sides — biasing the crop right keeps
          // her fully in frame instead of a centered crop trimming her out.
          className="object-cover object-[68%_50%] sm:hidden"
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
            <AuthForm mode="signup" />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
