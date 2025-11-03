import { Link } from "react-router-dom";

type HeroTile = {
  title: string;
  href: string;
  image: string;
  caption: string;
};

const heroTiles: HeroTile[] = [
  {
    title: "Menswear Essentials",
    href: "/products?collection=menswear",
    image: "2.jpeg",
    caption: "Tailored layers, built for the everyday hustle.",
  },
  {
    title: "New Drops",
    href: "/products?sort=new",
    image: "3.jpeg",
    caption: "Fresh arrivals and limited editions just released.",
  },
];

const CopyHeroSection: React.FC = () => {
  return (
    <section className="bg-[var(--color-cream)] py-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <header className="mb-14 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="space-y-4 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-brown-500)]">
              Shop All
            </p>
            <h1 className="text-5xl font-semibold leading-tight text-[var(--color-brown-900)] sm:text-6xl">
              Two editorials, one destination.
            </h1>
            <p className="text-base text-[var(--color-brown-600)] sm:text-lg leading-relaxed">
              Explore the full lineup through the visuals below — each image is
              your direct entry into a collection.
            </p>
          </div>

          <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-brown-400)] md:text-right">
            Featured Capsule · November
          </span>
        </header>

        {/* Hero Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {heroTiles.map((tile) => (
            <Link
              key={tile.title}
              to={tile.href}
              className="group relative block overflow-hidden rounded-2xl bg-[var(--color-sand)] shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Image */}
              <img
                src={tile.image}
                alt={tile.title}
                className="h-[480px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brown-950)]/80 via-[var(--color-brown-900)]/10 to-transparent" />

              {/* Text content */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-8 py-10 text-[var(--color-cream)]">
                <div className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] opacity-70">
                  <span className="block h-px w-8 bg-[var(--color-cream)]/70" />
                  Shop All
                </div>
                <h2 className="text-3xl font-semibold sm:text-4xl">
                  {tile.title}
                </h2>
                <p className="text-sm text-[var(--color-cream)]/80 max-w-md leading-relaxed">
                  {tile.caption}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CopyHeroSection;
