import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  MapPin,
  BadgeCheck,
  Users,
  ShieldCheck,
  User,
  ArrowRight,
  Send,
  Heart,
  Star
} from 'lucide-react';

const GALLERY_POOL = [
  { url: 'https://randomuser.me/api/portraits/men/32.jpg', label: 'Electrician' },
  { url: 'https://randomuser.me/api/portraits/women/44.jpg', label: 'House Help' },
  { url: 'https://randomuser.me/api/portraits/men/56.jpg', label: 'Delivery Partner' },
  { url: 'https://randomuser.me/api/portraits/men/12.jpg', label: 'Carpenter' },
  { url: 'https://randomuser.me/api/portraits/women/68.jpg', label: 'Chef' },
  { url: 'https://randomuser.me/api/portraits/men/77.jpg', label: 'Plumber' },
  { url: 'https://randomuser.me/api/portraits/women/23.jpg', label: 'Tailor' },
  { url: 'https://randomuser.me/api/portraits/men/89.jpg', label: 'Painter' },
  { url: 'https://randomuser.me/api/portraits/men/41.jpg', label: 'Mechanic' },
  { url: 'https://randomuser.me/api/portraits/women/15.jpg', label: 'Cleaner' }
];

const CATEGORIES = [
  'Security Guard',
  'Carpenter',
  'House Help',
  'Driver',
  'Cook',
  'Electrician',
  'Plumber',
  'Cleaner'
];

const STEPS = [
  { icon: MapPin, title: 'Find jobs near you', body: 'in your area' },
  { icon: BadgeCheck, title: 'Choose what suits you', body: 'time, pay, work type' },
  { icon: Users, title: 'Connect & get hired', body: 'in just a few swipes' },
  { icon: ShieldCheck, title: 'Work with confidence', body: 'verified profiles & real ratings' }
];

const DEMO_PROFILES = [
  { name: 'Ravi', category: 'Electrician', location: 'Kukatpally, Hyderabad', rating: 4.6, reviews: 14 },
  { name: 'Sunita', category: 'House Help', location: 'Banjara Hills, Hyderabad', rating: 4.9, reviews: 21 },
  { name: 'Imran', category: 'Delivery Partner', location: 'Secunderabad', rating: 4.3, reviews: 9 },
  { name: 'Lakshmi', category: 'Cook', location: 'Madhapur, Hyderabad', rating: 4.8, reviews: 17 }
];

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function RotatingCard({ startIndex, intervalMs, rotateDeg, sizeClass, z }) {
  const [index, setIndex] = useState(startIndex % GALLERY_POOL.length);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % GALLERY_POOL.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  const current = GALLERY_POOL[index];

  return (
    <div
      className={`relative ${sizeClass} bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden`}
      style={{ transform: `rotate(${rotateDeg}deg)`, zIndex: z }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.url}
          initial={{ opacity: 0, scale: 1.06, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={current.url}
            alt={current.label}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent px-3 py-2.5">
            <span className="text-white text-xs font-heading font-medium">
              {current.label}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SwipeDemo() {
  const [index, setIndex] = useState(0);
  const [toast, setToast] = useState(null);

  const profile = DEMO_PROFILES[index];

  const advance = (action) => {
    if (action === 'match') {
      setToast(`You matched with ${profile.name}! 🎉`);
      setTimeout(() => setToast(null), 1600);
    }
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % DEMO_PROFILES.length);
    }, action === 'match' ? 500 : 0);
  };

  return (
    <div className="relative w-72 mx-auto">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-teal text-white text-xs font-heading font-medium px-4 py-2 rounded-full whitespace-nowrap z-20"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={profile.name}
          initial={{ opacity: 0, x: 40, rotate: 4 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          exit={{ opacity: 0, x: -40, rotate: -4 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-br from-orangeLight to-tealLight px-6 pt-8 pb-6 text-center">
            <div className="w-20 h-20 rounded-full bg-white mx-auto flex items-center justify-center mb-3">
              <User className="w-9 h-9 text-teal" />
            </div>
            <p className="font-heading font-bold text-charcoal text-lg">{profile.name}</p>
            <span className="inline-block bg-white text-orange text-xs font-heading font-medium px-3 py-1 rounded-full mt-1">
              {profile.category}
            </span>
          </div>
          <div className="px-5 py-4 space-y-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-charcoalMuted">
              <MapPin className="w-4 h-4 text-teal" />
              {profile.location}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-orange text-orange" />
              <span className="text-charcoalMuted">
                {profile.rating} ({profile.reviews} reviews)
              </span>
            </div>
          </div>
          <div className="flex px-4 py-4 gap-2">
            <button
              onClick={() => advance('pass')}
              className="flex-1 h-11 rounded-xl border border-alert text-alert flex items-center justify-center hover:bg-alert hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => advance('request')}
              className="flex-1 h-11 rounded-xl bg-teal text-white flex items-center justify-center hover:opacity-90 transition"
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              onClick={() => advance('match')}
              className="flex-1 h-11 rounded-xl bg-orange text-white flex items-center justify-center hover:bg-orangeDark transition"
            >
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'How it works', id: 'how-it-works' },
    { label: 'Categories', id: 'categories' },
    { label: 'Safety', id: 'safety' },
    { label: 'About us', id: 'about' }
  ];

  return (
    <div className="bg-warmWhite min-h-screen font-body text-charcoal">
      <nav className="sticky top-0 z-30 bg-warmWhite/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-heading font-bold text-xl text-charcoal">
            myZip<span className="text-orange">Jobs</span>
          </span>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToId(link.id)}
                className="text-sm text-charcoalMuted hover:text-charcoal transition"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-body px-4 py-2 rounded-full border border-gray-200 text-charcoal hover:border-charcoal transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-body bg-orange text-white px-4 py-2 rounded-full hover:bg-orangeDark transition"
            >
              Register
            </button>
          </div>

          <button
            className="md:hidden text-charcoal"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 pb-4 flex flex-col gap-3 border-t border-gray-100 pt-3">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  scrollToId(link.id);
                  setMenuOpen(false);
                }}
                className="text-left text-sm text-charcoalMuted"
              >
                {link.label}
              </button>
            ))}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="flex-1 text-sm px-4 py-2 rounded-full border border-gray-200 text-charcoal"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="flex-1 text-sm bg-orange text-white px-4 py-2 rounded-full"
              >
                Register
              </button>
            </div>
          </div>
        )}
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-14 pb-16 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-heading font-bold text-4xl md:text-5xl leading-tight text-charcoal mb-5">
            Small jobs.
            <br />
            Big opportunities.
            <br />
            <span className="text-orange">Better lives.</span>
          </h1>
          <p className="text-charcoalMuted text-base md:text-lg mb-8 max-w-md">
            myZipJobs helps workers find daily jobs and employers get
            trusted help — quickly and easily.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={() => navigate('/register?role=worker')}
              className="bg-orange text-white font-heading font-medium px-6 py-3 rounded-xl hover:bg-orangeDark transition text-left"
            >
              <span className="block">Find Work</span>
              <span className="block text-xs font-body font-normal opacity-90">
                I am a Worker
              </span>
            </button>
            <button
              onClick={() => navigate('/register?role=employer')}
              className="bg-teal text-white font-heading font-medium px-6 py-3 rounded-xl hover:opacity-90 transition text-left"
            >
              <span className="block">Hire Someone</span>
              <span className="block text-xs font-body font-normal opacity-90">
                I am an Employer
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {['R', 'A', 'K'].map((initial, i) => (
                <div
                  key={initial}
                  className={`w-9 h-9 rounded-full border-2 border-warmWhite flex items-center justify-center text-xs font-heading font-bold ${
                    i % 2 === 0 ? 'bg-orangeLight text-orange' : 'bg-tealLight text-teal'
                  }`}
                >
                  {initial}
                </div>
              ))}
            </div>
            <p className="text-sm text-charcoalMuted">
              Job guarantee, hire your workers, on daily basis
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative h-[380px] flex items-center justify-center"
        >
          <div className="absolute left-4 top-2">
            <RotatingCard
              startIndex={0}
              intervalMs={2600}
              rotateDeg={-8}
              sizeClass="w-36 h-52"
              z={1}
            />
          </div>

          <RotatingCard
            startIndex={4}
            intervalMs={2300}
            rotateDeg={0}
            sizeClass="w-40 h-56"
            z={10}
          />

          <div className="absolute right-4 top-6">
            <RotatingCard
              startIndex={7}
              intervalMs={2800}
              rotateDeg={8}
              sizeClass="w-36 h-52"
              z={1}
            />
          </div>

          <div className="absolute bottom-0 right-2 bg-white rounded-xl border border-gray-100 shadow-md px-4 py-3 flex items-center gap-2 z-20">
            <ShieldCheck className="w-5 h-5 text-teal" />
            <div className="text-xs">
              <p className="font-heading font-bold text-charcoal leading-tight">Safe</p>
              <p className="font-heading font-bold text-charcoal leading-tight">Verified</p>
              <p className="font-heading font-bold text-charcoal leading-tight">Reliable</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="how-it-works" className="max-w-6xl mx-auto px-6 pb-16 scroll-mt-20">
        <div className="bg-orangeLight/40 rounded-2xl px-6 py-8 grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex flex-col gap-2">
                <Icon className="w-6 h-6 text-orange" />
                <p className="font-heading font-bold text-charcoal text-sm">{step.title}</p>
                <p className="text-xs text-charcoalMuted">{step.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="demo" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-8">
          <h2 className="font-heading font-bold text-2xl text-charcoal mb-2">
            See it in action
          </h2>
          <p className="text-charcoalMuted text-sm">
            This is exactly how matching works inside the app — try it.
          </p>
        </div>
        <SwipeDemo />
      </section>

      <section id="categories" className="max-w-6xl mx-auto px-6 pb-16 scroll-mt-20">
        <h2 className="font-heading font-bold text-2xl text-charcoal mb-2">
          Popular categories
        </h2>
        <p className="text-charcoalMuted text-sm mb-6">
          Tap a category to see who's hiring or looking for work near you.
        </p>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => navigate('/register?role=worker')}
              className="bg-white border border-gray-200 text-charcoal text-sm font-body px-4 py-2 rounded-full hover:border-teal hover:text-teal transition"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section id="safety" className="bg-white border-y border-gray-100 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-tealLight text-teal text-xs font-body font-medium px-3 py-1 rounded-full mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Built for trust
            </span>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-charcoal mb-4">
              Every profile carries a real track record.
            </h2>
            <p className="text-charcoalMuted max-w-md mb-6">
              After every job, both sides leave a rating and a review — so
              you know who you're connecting with before you say yes. If
              something feels wrong during a meetup, you can report it
              directly from the chat.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 text-orange font-heading font-medium hover:gap-3 transition-all"
            >
              Create your profile
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-warmWhite rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orangeLight flex items-center justify-center">
                <User className="w-5 h-5 text-orange" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-charcoal">Rated after every job</p>
                <p className="text-xs text-charcoalMuted">Real feedback, not guesswork</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-tealLight flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-teal" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-charcoal">Report a concern anytime</p>
                <p className="text-xs text-charcoalMuted">Right from your chat, in one tap</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="about" className="scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="text-charcoalMuted text-sm max-w-lg mb-8">
            myZipJobs is built in Hyderabad, for Hyderabad — connecting
            local workers and employers directly, without agencies or
            middlemen in between.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 pt-6">
            <span className="font-heading font-bold text-charcoal">
              myZip<span className="text-orange">Jobs</span>
            </span>
            <p className="text-xs text-charcoalMuted">
              Available in Telugu, Hindi, Urdu &amp; English
            </p>
            <span className="text-xs text-charcoalMuted">
              © {new Date().getFullYear()} myZipJobs, Hyderabad
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
