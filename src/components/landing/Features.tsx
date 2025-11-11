import { motion } from "framer-motion";
import { MapPin, Shield, Zap, Clock } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Live Tracking",
    description: "Track your ride in real-time with precise GPS updates every second. Know exactly where your driver is.",
  },
  {
    icon: Shield,
    title: "Driver Safety",
    description: "All captains are verified with background checks and ratings. Your safety is our top priority.",
  },
  {
    icon: Zap,
    title: "Instant Pickup",
    description: "Get matched with nearby drivers instantly. Average pickup time under 5 minutes in busy areas.",
  },
  {
    icon: Clock,
    title: "Always Available",
    description: "24/7 service with real-time availability. Book rides whenever you need them, day or night.",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-semibold text-foreground mb-4">
            Why Choose UrbanFlow
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional ride-hailing built for the modern city. Fast, safe, and reliable.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card rounded-2xl p-8 h-full shadow-elegant hover:shadow-elegant-lg transition-smooth">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-smooth">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;