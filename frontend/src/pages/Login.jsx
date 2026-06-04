import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function Login() {
  const handleLogin = () => {
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl w-full rounded-3xl border border-gray-200 overflow-hidden bg-white">
        <div className="relative h-[280px] md:h-auto">
          <img
            src="https://images.pexels.com/photos/26796497/pexels-photo-26796497.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#E07A5F]/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <div className="text-xs uppercase tracking-[0.2em] font-semibold opacity-90">Welcome to Pravesh</div>
            <p className="mt-2 text-2xl font-semibold leading-tight max-w-xs" style={{ fontFamily: "Outfit, sans-serif" }}>
              Your child's admissions, beautifully organised.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[#E07A5F] flex items-center justify-center mb-6">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Sign in to continue
          </h1>
          <p className="text-gray-600 mt-3">Save favourites and track your child's applications across Mumbai schools.</p>

          <Button
            onClick={handleLogin}
            className="mt-8 w-full rounded-xl bg-[#1F2937] hover:bg-[#E07A5F] text-white h-12 text-base transition-colors duration-200"
            data-testid="google-login-button"
          >
            Continue with Google <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>

          <p className="text-xs text-gray-500 mt-6 leading-relaxed">
            By continuing, you agree that Admitly will use your Google profile (name, email) to create your account.
          </p>
        </div>
      </div>
    </div>
  );
}
