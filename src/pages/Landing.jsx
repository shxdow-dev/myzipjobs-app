import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";

const FLOATING_EMOJIS = [
  { emoji: "🔨", className: "left-[8%] top-[12%]", delay: 0 },
  { emoji: "🍳", className: "right-[10%] top-[18%]", delay: 0.5 },
  { emoji: "🚗", className: "left-[15%] bottom-[25%]", delay: 1 },
  { emoji: "⚡", className: "right-[18%] bottom-[30%]", delay: 1.5 },
  { emoji: "🏗️", className: "left-[45%] top-[8%]", delay: 2 },
  { emoji: "🧹", className: "right-[8%] bottom-[15%]", delay: 2.5 },
];

function Landing() {
  return (
    <main className="relative overflow-hidden px-4">
      <section className="landing-gradient relative mx-auto flex max-w-6xl justify-center py-12 md:py-20">
        {FLOATING_EMOJIS.map(({ emoji, className, delay }) => (
          <motion.span
            key={emoji}
            className={`pointer-events-none absolute text-3xl md:text-4xl ${className}`}
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay }}
          >
            {emoji}
          </motion.span>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-[640px] text-center"
        >
          <h1 className="font-heading text-4xl font-bold leading-tight text-charcoal md:text-6xl">
            Find work. Find help. Find each other.
          </h1>
          <p className="mt-5 font-body text-lg text-charcoalMuted">
            myZipJobs connects workers and employers nearby — swipe, match,
            and get to work.
          </p>
          <div className="mt-8 flex flex-col gap-4 md:flex-row md:justify-center">
            <Link to="/register?role=worker" className="md:min-w-[220px]">
              <Button className="w-full">Find Work</Button>
            </Link>
            <Link to="/register?role=employer" className="md:min-w-[220px]">
              <Button variant="secondary" className="w-full">
                Hire Someone
              </Button>
            </Link>
          </div>
          <p className="mt-6 font-body text-sm text-charcoalMuted">
            500+ Workers • 200+ Employers • 150+ Matches
          </p>
        </motion.div>
      </section>
    </main>
  );
}

export default Landing;
