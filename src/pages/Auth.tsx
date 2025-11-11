import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Users, Zap, Lock, ArrowRight } from "lucide-react";

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userType, setUserType] = useState<"passenger" | "driver">("passenger");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const missingSupabase = useMemo(() => {
    return !(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  }, []);

  // Prefer an explicit configured site URL for OAuth redirects (useful in CI/production).
  // Set VITE_APP_URL in Vercel to your production domain (e.g. https://urban-flow-nu.vercel.app).
  const REDIRECT_BASE = (import.meta.env.VITE_APP_URL as string) || window.location.origin;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, isLogin: boolean) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const email = (formData.get("email") || "").toString();
    const password = (formData.get("password") || "").toString();

    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter email and password",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!isLogin && passwordConfirm !== password) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL ? "Set" : "Missing");
    console.log("Supabase Key:", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "Set" : "Missing");

    if (missingSupabase) {
      toast({
        title: "Backend not configured",
        description: "Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        console.log("Attempting login for:", email);
        const res = await supabase.auth.signInWithPassword({ email, password });

        if (res.error) {
          console.error("Login error:", res.error);
          toast({
            title: "Sign in failed",
            description:
              res.error.message === "Invalid login credentials"
                ? "Incorrect email or password. Please try again."
                : res.error.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const session = res.data?.session;
        const user = res.data?.user;

        if (session && user) {
          console.log("Login successful, user:", user.email);
          toast({ title: "Signed in", description: "Redirecting to your dashboard..." });
          setTimeout(() => navigate(`/${userType}/dashboard`), 350);
        } else {
          console.warn("No session or user after successful login");
          toast({
            title: "Authentication error",
            description: "Login succeeded but no session was created. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        console.log("Attempting registration for:", email);
        const res = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { user_type: userType },
            emailRedirectTo: `${window.location.origin}/${userType}/dashboard`,
          },
        });

        if (res.error) {
          console.error("Registration error:", res.error);
          toast({ title: "Sign up failed", description: res.error.message, variant: "destructive" });
          setIsLoading(false);
          return;
        }

        toast({
          title: "Account created",
          description: "Please check your email for verification.",
        });
        setPasswordConfirm("");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast({
        title: "Unexpected error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      // Debug: show which redirect URL we will request from Supabase
      const redirectToUrl = `${REDIRECT_BASE}/${userType}/dashboard`;
      console.log("OAuth redirect config:", { VITE_APP_URL: import.meta.env.VITE_APP_URL, windowOrigin: window.location.origin, REDIRECT_BASE, redirectToUrl });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectToUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google login error:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      const lower = errorMsg.toLowerCase();
      // Provide a clearer message when Google provider isn't configured in Supabase
      const isProviderMissing =
        lower.includes("unsupported provider") || lower.includes("missing oauth secret") || lower.includes("provider not supported");

      toast({
        title: isProviderMissing ? "Enable Google in Supabase" : "Google sign in failed",
        description: isProviderMissing
          ? "In Supabase Dashboard → Authentication → Providers → Google: toggle ON and paste your Google Client ID and Client Secret. Also ensure redirect URI is set to your Supabase callback."
          : errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center relative overflow-hidden">
      {/* Decorative elements */}
      <div aria-hidden className="absolute -z-10 top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20" />
      <div aria-hidden className="absolute -z-10 bottom-0 left-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-30" />

      <div className="container mx-auto px-4 lg:px-6 py-4 max-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-8 items-center w-full">
          {/* Left: Value Proposition */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block space-y-8"
          >
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">UrbanFlow</h1>
              <p className="text-xl text-gray-600">Smart mobility, every journey</p>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Zap className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Fast & Reliable</h3>
                  <p className="text-gray-600 mt-1">Get where you need to go, quickly</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Community Driven</h3>
                  <p className="text-gray-600 mt-1">Join thousands of verified users</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg">
                    <Lock className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Safe & Secure</h3>
                  <p className="text-gray-600 mt-1">Your security is our priority</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Auth Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center"
          >
            <Card className="w-full max-w-md shadow-2xl border border-gray-200/50">
              <CardHeader className="space-y-1 pb-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
                <CardTitle className="text-2xl font-bold text-gray-900">UrbanFlow</CardTitle>
                <CardDescription className="text-gray-600 text-sm">
                  {authMode === "login" ? "Sign in to your account" : "Create your account"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {/* User Type Selector - More Interactive */}
                <div className="mb-4 space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">I am a</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "passenger", label: "Passenger", icon: "👤" },
                      { id: "driver", label: "Driver", icon: "🚗" },
                    ].map((option) => (
                      <motion.button
                        key={option.id}
                        type="button"
                        onClick={() => setUserType(option.id as "passenger" | "driver")}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-200 relative overflow-hidden ${
                          userType === option.id
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                        }`}
                      >
                        <motion.div
                          layoutId="usertype-indicator"
                          className="absolute inset-0 -z-10"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <span className="flex items-center justify-center gap-2">
                          {option.label}
                          {userType === option.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 40 }}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </motion.div>
                          )}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Auth Mode Selector - More Interactive */}
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
                    {[
                      { id: "login", label: "Sign In" },
                      { id: "register", label: "Create" },
                    ].map((mode) => (
                      <motion.button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setAuthMode(mode.id as "login" | "register");
                          setPasswordConfirm("");
                        }}
                        whileHover={{ y: -2 }}
                        className={`py-2.5 px-4 rounded-md font-semibold transition-all duration-200 ${
                          authMode === mode.id
                            ? "bg-white text-blue-600 shadow-md"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {mode.label}
                        {authMode === mode.id && (
                          <motion.div
                            layoutId="authmode-underline"
                            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full"
                            transition={{ type: "spring", stiffness: 400, damping: 40 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Form */}
                <AnimatePresence mode="wait">
                  <motion.form
                    key={authMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={(e) => handleSubmit(e, authMode === "login")}
                    className="space-y-3"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold text-gray-700">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        type="email"
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm py-1.5"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs font-semibold text-gray-700">
                        Password
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter password"
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm py-1.5"
                      />
                    </div>

                    {authMode === "register" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1.5"
                      >
                        <Label htmlFor="password-confirm" className="text-xs font-semibold text-gray-700">
                          Confirm Password
                        </Label>
                        <Input
                          id="password-confirm"
                          type="password"
                          placeholder="Confirm password"
                          required
                          value={passwordConfirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm py-1.5"
                        />
                      </motion.div>
                    )}

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-1.5 rounded-lg transition-all duration-200 h-auto text-sm"
                        disabled={isLoading}
                      >
                        {isLoading ? "Processing..." : authMode === "login" ? "Sign In" : "Create Account"}
                      </Button>
                    </motion.div>
                  </motion.form>
                </AnimatePresence>

                {/* Divider */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500 font-medium">Or continue with</span>
                  </div>
                </div>

                {/* Google Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                  disabled={isLoading}
                  onClick={handleGoogleLogin}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Google</span>
                </motion.button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
