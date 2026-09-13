import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Shirt,
  Building2,
  Palette,
  User,
  GraduationCap,
  Trophy,
  Gamepad2,
  Dumbbell,
  Calendar,
  Users,
  Store,
  Coffee,
  Rocket,
  Flame,
  CheckCircle2,
  Compass,
  TrendingUp,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    document.title = 'About Us | KALA — Your Idea. Your Brand. Your Identity.';
    window.scrollTo(0, 0);
  }, []);

  const audienceSegments = [
    { name: 'Individuals', icon: User },
    { name: 'College communities', icon: GraduationCap },
    { name: 'Sports teams', icon: Trophy },
    { name: 'Gaming communities', icon: Gamepad2 },
    { name: 'Gyms', icon: Dumbbell },
    { name: 'Events', icon: Calendar },
    { name: 'Creators', icon: Palette },
    { name: 'Clubs', icon: Users },
    { name: 'Local businesses', icon: Store },
    { name: 'Cafes & restaurants', icon: Coffee },
    { name: 'Startups', icon: Rocket },
    { name: 'Growing brands', icon: Flame },
  ];

  const steps = [
    {
      step: '01',
      title: 'YOUR IDEA',
      description: 'You bring the idea, reference, artwork, or simply tell us what you have in mind.',
      meta: 'Concept & Brief',
    },
    {
      step: '02',
      title: 'OUR DESIGN',
      description: 'We help shape the idea into something clear, usable, and ready to create.',
      meta: 'Visual Prototyping',
    },
    {
      step: '03',
      title: 'MADE BY KALA',
      description: 'Your final design becomes a physical product or brand material.',
      meta: 'Production & Delivery',
    },
  ];

  const pillars = [
    {
      title: 'DESIGN-FIRST',
      description: 'We care about how your idea looks, not just how it gets printed.',
      icon: Palette,
    },
    {
      title: 'MADE AROUND YOU',
      description: 'Your requirements come first. We create around your purpose, style, and identity.',
      icon: Compass,
    },
    {
      title: 'SIMPLE PROCESS',
      description: 'From idea to final product, we keep the experience straightforward.',
      icon: CheckCircle2,
    },
    {
      title: 'BUILT TO GROW',
      description: 'Start with one product and build toward a complete identity as your needs grow.',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-kala-emerald selection:text-white">
      {/* ========================================================================= */}
      {/* SECTION 1 — HERO                                                          */}
      {/* ========================================================================= */}
      <section
        id="about-hero"
        aria-labelledby="about-hero-heading"
        className="relative pt-36 sm:pt-44 pb-20 sm:pb-28 overflow-hidden border-b border-border bg-radial from-kala-emerald/5 via-background to-background"
      >
        {/* Grain overlay */}
        <div className="hero-grain" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Small Label */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-kala-emerald/10 border border-kala-emerald/20 text-kala-emerald dark:text-emerald-400 text-xs font-bold uppercase tracking-widest"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ABOUT KALA</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              id="about-hero-heading"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight text-foreground leading-[0.95]"
            >
              More than just printing.
            </motion.h1>

            {/* Short Supporting Text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-serif text-xl sm:text-2xl md:text-3xl italic text-foreground/80 font-normal max-w-3xl mx-auto leading-snug"
            >
              &ldquo;KALA is built around a simple idea &mdash; your identity should look the way you imagine it.&rdquo;
            </motion.p>

            {/* Subtle Brand Element Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-4 max-w-xl mx-auto flex items-center justify-center gap-4 text-[11px] font-mono uppercase tracking-[0.25em] text-mid"
            >
              <span className="h-px flex-1 bg-border" />
              <span className="text-foreground/90 font-semibold">Your Idea &bull; Your Brand &bull; Your Identity</span>
              <span className="h-px flex-1 bg-border" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2 — OUR STORY / WHO WE ARE                                        */}
      {/* ========================================================================= */}
      <section
        id="our-story"
        aria-labelledby="our-story-heading"
        className="py-20 sm:py-28 bg-card/40 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Narrative Copy */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-kala-earth dark:text-kala-accent block">
                  WHO WE ARE
                </span>
                <h2
                  id="our-story-heading"
                  className="font-serif text-4xl sm:text-5xl md:text-6xl font-black uppercase text-foreground leading-[1]"
                >
                  Built around your idea.
                </h2>
              </div>

              <div className="space-y-5 text-sm sm:text-base text-mid leading-relaxed font-body">
                <p>
                  KALA brings design and printing together to make custom apparel and branding simple, personal, and accessible.
                </p>
                <p>
                  From a single T-shirt to merchandise for an entire group, or from a new logo to the printed materials that represent a business &mdash; we help turn ideas into something people can see, wear, and remember.
                </p>
              </div>

              {/* Core studio philosophy badge */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-mono font-semibold uppercase tracking-wider text-foreground">
                  <span className="w-2 h-2 rounded-full bg-kala-emerald" />
                  No Minimum Barrier
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-mono font-semibold uppercase tracking-wider text-foreground">
                  <span className="w-2 h-2 rounded-full bg-[#8a4f35]" />
                  Design-First Studio
                </span>
              </div>
            </motion.div>

            {/* Right Column: Visual Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="lg:col-span-6 relative"
            >
              <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-xl group">
                <div className="aspect-4/3 sm:aspect-16/11 overflow-hidden bg-[#faf8f5] dark:bg-[#151412]">
                  <img
                    src="/about/about2.png"
                    alt="KALA Custom Apparel Craft and Design"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Subtle studio caption pill */}
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md border border-border text-foreground text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                  KALA Studio Craft
                </div>

                <div className="p-6 bg-card border-t border-border flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-base font-bold uppercase text-foreground">
                      Physical Goods with Purpose
                    </h3>
                    <p className="text-xs text-mid mt-0.5">
                      Wearable identity, packaging essentials, and custom artwork.
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-kala-emerald/10 text-kala-emerald dark:text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3 — WHAT WE DO                                                    */}
      {/* ========================================================================= */}
      <section
        id="what-we-create"
        aria-labelledby="what-we-create-heading"
        className="py-20 sm:py-28 bg-background border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
            <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-kala-emerald dark:text-emerald-400 block mb-2">
              OUR CAPABILITIES
            </span>
            <h2
              id="what-we-create-heading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-black uppercase text-foreground leading-[1]"
            >
              What we create.
            </h2>
            <p className="text-sm sm:text-base text-mid mt-3 font-body">
              Three focused pillars designed to turn individual concepts and business visions into tangible products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* CARD 1: CUSTOM APPAREL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-card border border-border rounded-3xl p-8 sm:p-10 flex flex-col justify-between group hover:border-kala-emerald hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-kala-emerald/10 text-kala-emerald dark:text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-105">
                  <Shirt className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-mid font-semibold block mb-1">
                    01 &bull; APPAREL
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tight">
                    CUSTOM APPAREL
                  </h3>
                </div>
                <p className="text-sm text-mid leading-relaxed font-body">
                  Custom T-shirts, jerseys, oversized fits, merchandise, and more &mdash; made around your idea.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  {['Oversized Tees', 'Jerseys', 'Hoodies', 'Merch'].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-background border border-border text-[11px] font-mono text-mid"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-border">
                <Link
                  to="/custom-apparel"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-kala-emerald dark:text-emerald-400 group-hover:translate-x-1 transition-transform"
                >
                  <span>Explore Custom Apparel</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* CARD 2: BUSINESS BRANDING */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card border border-border rounded-3xl p-8 sm:p-10 flex flex-col justify-between group hover:border-[#8a4f35] hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-[#8a4f35]/10 text-[#8a4f35] dark:text-[#d28c6e] flex items-center justify-center transition-transform group-hover:scale-105">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-mid font-semibold block mb-1">
                    02 &bull; BRANDING
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tight">
                    BUSINESS BRANDING
                  </h3>
                </div>
                <p className="text-sm text-mid leading-relaxed font-body">
                  Printed and branded essentials that help businesses look consistent and professional.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  {['Packaging', 'Carry Bags', 'Labels', 'Staff Uniforms'].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-background border border-border text-[11px] font-mono text-mid"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-border">
                <Link
                  to="/business-branding"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8a4f35] dark:text-[#d28c6e] group-hover:translate-x-1 transition-transform"
                >
                  <span>Explore Business Branding</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* CARD 3: CUSTOM DESIGN */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card border border-border rounded-3xl p-8 sm:p-10 flex flex-col justify-between group hover:border-kala-accent hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-transform group-hover:scale-105">
                  <Palette className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-mid font-semibold block mb-1">
                    03 &bull; DESIGN
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tight">
                    CUSTOM DESIGN
                  </h3>
                </div>
                <p className="text-sm text-mid leading-relaxed font-body">
                  From artwork and graphics to logos and brand visuals, we help shape the look behind your idea.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  {['Vector Graphics', 'Logo Marks', 'Print Layouts', 'Visual Identity'].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-background border border-border text-[11px] font-mono text-mid"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-border">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-kala-accent group-hover:translate-x-1 transition-transform"
                >
                  <span>Connect With Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4 — WHO KALA IS FOR                                               */}
      {/* ========================================================================= */}
      <section
        id="who-kala-is-for"
        aria-labelledby="who-kala-is-for-heading"
        className="py-20 sm:py-28 bg-card/40 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-kala-earth dark:text-kala-accent block mb-2">
              COMMUNITY &amp; PARTNERS
            </span>
            <h2
              id="who-kala-is-for-heading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-black uppercase text-foreground leading-[1]"
            >
              Made for people with something to say.
            </h2>
          </div>

          {/* Compact visual grid of 12 segments */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 max-w-5xl mx-auto">
            {audienceSegments.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 hover:border-foreground/30 hover:bg-card shadow-xs hover:shadow-md transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-kala-emerald dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-serif text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                    {item.name}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Short concluding line */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-12 pt-4"
          >
            <p className="font-serif text-lg sm:text-xl italic text-foreground/85 font-medium max-w-2xl mx-auto">
              &ldquo;Whether it&rsquo;s one piece or something bigger, KALA helps bring your identity to life.&rdquo;
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5 — OUR APPROACH                                                  */}
      {/* ========================================================================= */}
      <section
        id="how-we-work"
        aria-labelledby="how-we-work-heading"
        className="py-20 sm:py-28 bg-background border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-kala-emerald dark:text-emerald-400 block mb-2">
              OUR APPROACH
            </span>
            <h2
              id="how-we-work-heading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-black uppercase text-foreground leading-[1]"
            >
              How we work.
            </h2>
            <p className="text-sm sm:text-base text-mid mt-3 font-body">
              A transparent, seamless journey from initial conversation to finished product.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((stepItem, idx) => (
              <motion.div
                key={stepItem.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="bg-card border border-border rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-sm relative group hover:border-kala-emerald/60 hover:shadow-lg transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-kala-emerald dark:text-emerald-400">
                      {stepItem.step}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-mid bg-background border border-border px-2.5 py-1 rounded-full">
                      {stepItem.meta}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-black uppercase tracking-tight text-foreground pt-2">
                    {stepItem.title}
                  </h3>

                  <p className="text-sm text-mid leading-relaxed font-body">
                    {stepItem.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-border flex items-center gap-2 text-xs font-mono text-mid uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-kala-emerald" />
                  <span>Step {stepItem.step} of 03</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6 — THE KALA PHILOSOPHY                                           */}
      {/* ========================================================================= */}
      <section
        id="kala-philosophy"
        aria-labelledby="kala-philosophy-heading"
        className="py-20 sm:py-28 bg-[#181614] text-white relative overflow-hidden"
      >
        {/* Subtle noise grain and warm radial accent */}
        <div className="hero-grain opacity-20" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-kala-emerald/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#8a4f35]/20 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-[#f2a883] block mb-3">
              THE KALA PHILOSOPHY
            </span>
            <h2
              id="kala-philosophy-heading"
              className="font-serif text-3xl sm:text-5xl md:text-6xl font-black uppercase text-white tracking-tight leading-[1.05]"
            >
              From one T-shirt to an entire brand identity.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-3xl mx-auto"
          >
            <p className="font-body text-base sm:text-lg md:text-xl text-white/80 leading-relaxed italic">
              &ldquo;We believe customization should feel personal. Your products should represent your people, your business, your community, and your identity &mdash; not look like something made for everyone.&rdquo;
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="pt-4 flex items-center justify-center gap-4 text-xs font-mono tracking-widest text-white/50 uppercase"
          >
            <span className="h-px w-12 bg-white/20" />
            <span>KALA Originals &bull; Pure Identity</span>
            <span className="h-px w-12 bg-white/20" />
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7 — WHY KALA                                                      */}
      {/* ========================================================================= */}
      <section
        id="why-kala"
        aria-labelledby="why-kala-heading"
        className="py-20 sm:py-28 bg-background border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-kala-emerald dark:text-emerald-400 block mb-2">
              THE KALA STANDARD
            </span>
            <h2
              id="why-kala-heading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-black uppercase text-foreground leading-[1]"
            >
              Why KALA?
            </h2>
            <p className="text-sm sm:text-base text-mid mt-3 font-body">
              Four principles guiding every piece of apparel and branded collateral we craft.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card border border-border rounded-3xl p-7 sm:p-8 flex flex-col justify-between hover:border-kala-emerald/50 hover:shadow-lg transition-all"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-kala-emerald/10 text-kala-emerald dark:text-emerald-400 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold uppercase tracking-tight text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-mid leading-relaxed font-body">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-border/60 flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-kala-emerald">0{index + 1}</span>
                    <span className="h-px flex-1 bg-border/40" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8 — FINAL CTA                                                     */}
      {/* ========================================================================= */}
      <section
        id="about-cta"
        aria-labelledby="about-cta-heading"
        className="py-20 sm:py-28 bg-[#853816] text-white relative overflow-hidden"
      >
        <div className="hero-grain opacity-20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#f2a883] block">
              START YOUR PROJECT
            </span>
            <h2
              id="about-cta-heading"
              className="font-serif text-4xl sm:text-5xl md:text-6xl font-black uppercase text-white tracking-tight leading-tight"
            >
              Have an idea?
            </h2>
            <p className="font-serif text-xl sm:text-2xl italic text-white/90 font-normal">
              &ldquo;Let&rsquo;s turn it into something real.&rdquo;
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
          >
            {/* Primary Button */}
            <Link
              to="/custom-apparel"
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#853816] hover:bg-amber-50 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 shrink-0"
            >
              <span>Create Custom Apparel</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Secondary Button */}
            <Link
              to="/business-branding"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <span>Build Your Brand</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
