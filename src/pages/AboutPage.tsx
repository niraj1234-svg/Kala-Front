import React from "react";
import { Sparkles, Leaf, Award, Ruler } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import Footer from "../components/Footer";

const coreValues = [
  {
    icon: <Sparkles className="h-6 w-6 text-[#d4b896]" />,
    title: "Design-led Craft",
    description:
      "Every silhouette starts with a sketch that balances modern lines with timeless appeal."
  },
  {
    icon: <Leaf className="h-6 w-6 text-[#d4b896]" />,
    title: "Thoughtful Materials",
    description:
      "We source breathable natural fabrics and innovative blends that respect the planet."
  },
  {
    icon: <Award className="h-6 w-6 text-[#d4b896]" />,
    title: "Uncompromised Quality",
    description:
      "Pieces are finished by seasoned artisans who ensure impeccable fall, stitch, and feel."
  }
];

const craftsmanshipSteps = [
  {
    step: "Research & Moodboarding",
    detail: "Our design studio studies global culture, art, and street influence to build unique narratives."
  },
  {
    step: "Pattern Architecture",
    detail: "Tailoring experts translate concepts into precision patterns that flatter diverse bodies."
  },
  {
    step: "Hand Cut & Crafted",
    detail: "Small-batch production means each piece is hand cut, stitched, and finished with care."
  },
  {
    step: "Fit & Feel Refinement",
    detail: "Every garment passes through multiple fit rounds and fabric treatments for ease of movement."
  }
];

const timeline = [
  {
    year: "2018",
    title: "The Spark",
    description: "Appral begins in a Jaipur studio, blending couture craftsmanship with urban energy."
  },
  {
    year: "2020",
    title: "The Atelier",
    description: "We scaled our atelier, collaborating with 20+ artisans across India."
  },
  {
    year: "2022",
    title: "Going Global",
    description: "Our first international pop-up in Dubai introduced Appral to a wider audience."
  },
  {
    year: "2024",
    title: "Sustainable Pivot",
    description: "We launched Rewear, our upcycling program, to extend life cycles of signature pieces."
  }
];

const team = [
  {
    name: "Aparna Sharma",
    role: "Creative Director",
    blurb: "Obsessed with building stories through contrasting textures and spontaneous movement."
  },
  {
    name: "Rahul",
    role: "Head of Craft",
    blurb: "A third-generation tailor who ensures every seam holds to couture standards."
  },
  {
    name: "Lisa Fernandes",
    role: "Community & Culture",
    blurb: "Curates collaborations and residencies with artists, photographers, and storytellers."
  }
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 }
  }
};

const viewportConfig = { once: true, amount: 0.25 };

const AboutPage: React.FC = () => {
  return (
    <main className="bg-[#fefaf6] text-slate-900">
      {/* Hero Section */}
      <motion.section
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="relative overflow-hidden bg-gradient-to-br from-[#fefaf6] via-[#fbf4ec] to-white"
      >
        <motion.div
          className="absolute inset-0 opacity-40"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="bg-[url('/10.jpeg')] bg-cover bg-center blur-3xl h-full w-full" />
        </motion.div>
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-10 px-6 pt-32 pb-24 sm:px-10 sm:pt-36 sm:pb-28 lg:flex-row lg:items-center lg:pt-40 lg:pb-32">
          <motion.div
            className="flex-1 space-y-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#9c7d5e]">
              Our Story
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl font-semibold text-[#5c4734] sm:text-5xl lg:text-[54px] lg:leading-tight">
              Crafting couture energy for everyday roamers.
            </motion.h1>
            <motion.p variants={fadeUp} className="max-w-xl text-base text-slate-600 sm:text-lg">
              Appral is a studio-style fashion label raised on curiosity, collaboration, and the love of effortless movement. From our atelier to the street, each drop is rooted in storytelling, mindful construction, and the joy of getting dressed.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 text-sm sm:text-base">
              <div className="rounded-full border border-[#d4b896]/60 bg-white/60 px-4 py-2 text-[#5c4734]">
                Founded in Jaipur, built for the world
              </div>
              <div className="rounded-full border border-[#d4b896]/60 bg-white/60 px-4 py-2 text-[#5c4734]">
                Female-led, artisan-powered
              </div>
            </motion.div>
          </motion.div>
          <motion.div
            className="flex-1"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            <div className="grid grid-cols-2 gap-4">{
              ["4.jpeg", "7.jpeg", "5.jpeg", "8.jpeg"].map((src, index) => (
                <motion.div
                  key={src}
                  className={`aspect-[3/4] overflow-hidden rounded-3xl border border-white/70 shadow-lg shadow-[#d4b896]/20 ${
                    index % 2 === 0 ? "translate-y-6" : "-translate-y-6"
                  }`}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <img src={src} alt="Appral mood" className="h-full w-full object-cover" loading="lazy" />
                </motion.div>
              ))
            }</div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="border-y border-[#f4e8d8] bg-white/80"
      >
        <motion.div
          className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-[#f4e8d8] px-6 py-12 text-center sm:grid-cols-4"
          variants={stagger}
        >
          {[{ label: "Artisans", value: "24" }, { label: "Cities Served", value: "18" }, { label: "Pieces Crafted", value: "12K" }, { label: "Upcycled", value: "3.5K" }].map((item) => (
            <motion.div key={item.label} className="space-y-1" variants={fadeUp}>
              <p className="text-3xl font-semibold text-[#5c4734]">{item.value}</p>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Core values */}
      <motion.section
        className="mx-auto max-w-6xl px-6 py-20 sm:px-10"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        <motion.div className="mb-12 max-w-3xl space-y-4" variants={stagger}>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Why we create</p>
          <h2 className="text-3xl font-semibold text-[#5c4734] sm:text-4xl">Our manifesto is stitched into every seam.</h2>
          <p className="text-sm text-slate-600 sm:text-base">
            We believe luxury can be lived in, not just looked at. Our process honors both the craftsperson and the modern dresser looking for ease, flair, and longevity.
          </p>
        </motion.div>
        <motion.div className="grid gap-6 sm:grid-cols-3" variants={stagger}>
          {coreValues.map((item) => (
            <motion.article
              key={item.title}
              className="rounded-3xl border border-[#f4e8d8] bg-white/90 p-8 shadow-sm shadow-[#f4e8d8]/30"
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
            >
              <div className="mb-6 inline-flex items-center justify-center rounded-full bg-[#fbf4ec] p-3">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-[#5c4734]">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{item.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      {/* Craftsmanship Journey */}
      <motion.section
        className="border-y border-[#f4e8d8] bg-white/70"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
          <motion.div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" variants={stagger}>
            <div className="space-y-3 lg:max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Crafted in stages</p>
              <h2 className="text-3xl font-semibold text-[#5c4734] sm:text-4xl">From inspiration to the final press.</h2>
              <p className="text-sm text-slate-600 sm:text-base">
                Each garment travels through a mindful journey of experimentation, tailoring, and final touches.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4b896]/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#9c7d5e]">
              <Ruler className="h-4 w-4" /> Slow-made fashion
            </div>
          </motion.div>
          <motion.div className="grid gap-6 md:grid-cols-2" variants={stagger}>
            {craftsmanshipSteps.map((stage, index) => (
              <motion.div
                key={stage.step}
                className="rounded-3xl border border-[#f4e8d8] bg-white/90 p-8 shadow-sm"
                variants={fadeUp}
                whileHover={{ y: -4 }}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d4b896]">Step {index + 1}</span>
                <h3 className="mt-3 text-xl font-semibold text-[#5c4734]">{stage.step}</h3>
                <p className="mt-3 text-sm text-slate-600">{stage.detail}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Timeline */}
      <motion.section
        className="mx-auto max-w-6xl px-6 py-20 sm:px-10"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        <motion.div className="mb-12 space-y-4" variants={stagger}>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Milestones</p>
          <h2 className="text-3xl font-semibold text-[#5c4734] sm:text-4xl">Moments that shaped Appral.</h2>
        </motion.div>
        <motion.div className="relative border-l border-[#d4b896]/40 pl-8" variants={stagger}>
          {timeline.map((item, index) => (
            <motion.div key={item.year} className="relative mb-10 last:mb-0" variants={fadeUp}>
              <span className="absolute -left-[11px] inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#d4b896]" aria-hidden />
              <div className="rounded-3xl border border-[#f4e8d8] bg-white/90 p-8 shadow-sm shadow-[#f4e8d8]/30">
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b89a7a]">{item.year}</span>
                <h3 className="mt-3 text-lg font-semibold text-[#5c4734]">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{item.description}</p>
              </div>
              {index !== timeline.length - 1 && (
                <div className="absolute left-[-1px] top-5 h-full border-l border-dashed border-[#d4b896]/40" aria-hidden />
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Team */}
      <motion.section
        className="border-y border-[#f4e8d8] bg-white/70"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
          <motion.div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" variants={stagger}>
            <div className="space-y-3 lg:max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">People of Appral</p>
              <h2 className="text-3xl font-semibold text-[#5c4734] sm:text-4xl">Meet the minds building your wardrobe experiences.</h2>
            </div>
            <p className="max-w-md text-sm text-slate-600 sm:text-base">
              We are stylists, pattern makers, storytellers, and innovators—bound by the belief that clothing can empower daily rituals.
            </p>
          </motion.div>
          <motion.div className="grid gap-6 sm:grid-cols-3" variants={stagger}>
            {team.map((member) => (
              <motion.article
                key={member.name}
                className="rounded-3xl border border-[#f4e8d8] bg-white/90 p-8 text-center shadow-sm"
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
              >
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-[#fbf4ec]" aria-hidden />
                <h3 className="text-lg font-semibold text-[#5c4734]">{member.name}</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-[#b89a7a]">{member.role}</p>
                <p className="mt-3 text-sm text-slate-600">{member.blurb}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </main>
  );
};

export default AboutPage;
