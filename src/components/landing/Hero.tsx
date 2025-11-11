import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroIllustration from "@/assets/hero-illustration.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-card">
      {/* Header with Logo */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 lg:px-20 py-6 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <span className="text-2xl font-bold text-foreground">UrbanFlow</span>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-20 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-semibold text-foreground leading-tight">
                Move Smarter.
                <br />
                <span className="text-primary">Travel Faster.</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed"
            >
              Experience premium city mobility with real-time tracking, verified drivers, and instant pickups. Your journey, reimagined.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                className="text-base px-12 py-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:scale-105 shadow-xl hover:shadow-primary/20 transition-all duration-300"
                onClick={() => navigate("/auth")}
              >
                Get Started
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-elegant-lg">
              <img
                src={heroIllustration}
                alt="City transportation illustration"
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </div>

  {/* Subtle Background Decoration (non-interactive) */}
  <div aria-hidden="true" className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
  <div aria-hidden="true" className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />
    </section>
  
  );
};

export default Hero;