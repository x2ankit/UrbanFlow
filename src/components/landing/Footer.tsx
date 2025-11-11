import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-6 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">UrbanFlow</h3>
            <p className="text-muted-foreground">Move smarter. Travel faster.</p>
          </div>

          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-smooth">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition-smooth">
              Terms of Service
            </a>
            <a href="#" className="hover:text-foreground transition-smooth">
              Support
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground"
        >
          © {new Date().getFullYear()} UrbanFlow. All rights reserved.
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;