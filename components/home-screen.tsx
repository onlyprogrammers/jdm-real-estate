"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  Heart,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { sampleProperties } from "@/data/sample-properties";

type Listing = {
  id: string;
  title: string;
  locality: string;
  price: number;
  purpose: string;
  type: string;
  bedrooms?: number | null;
  area?: number | null;
  images?: string[] | null;
  verifiedAt?: string | null;
  sample?: boolean;
};
const localities = [
  {
    name: "Golf Course Road",
    note: "A considered city address",
    image: "/images/gurugram-residences.png",
    tone: "from-[#706b5f] to-[#343e36]",
  },
  {
    name: "DLF Phase 3",
    note: "Close to the city’s business district",
    image: "/images/sample-builder-floor.png",
    tone: "from-[#877b68] to-[#3d5145]",
  },
  {
    name: "Dwarka Expressway",
    note: "A growing Gurugram corridor",
    image: "/images/sample-apartment.png",
    tone: "from-[#6e7770] to-[#34463c]",
  },
];
const categories = [
  "Apartments",
  "Builder floors",
  "Villas & houses",
  "Residential plots",
  "Office spaces",
  "Retail & commercial",
];
const price = (value: number, purpose: string) =>
  purpose === "rent" || purpose === "pg"
    ? `₹${new Intl.NumberFormat("en-IN").format(value)} / month`
    : `₹${new Intl.NumberFormat("en-IN").format(value)}`;

export function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [purpose, setPurpose] = useState("sale");
  const [propertyType, setPropertyType] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [status, setStatus] = useState<
    "loading" | "ready" | "sample"
  >("loading");
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/properties?page=1&pageSize=4")
      .then(async (response) => {
        const data = await response.json();
        if (!active) return;
        const live = Array.isArray(data.properties)
          ? (data.properties as Listing[])
          : [];
        setListings(live.length ? live : sampleProperties);
        setStatus(live.length ? "ready" : "sample");
      })
      .catch(() => {
        if (active) {
          setListings(sampleProperties);
          setStatus("sample");
        }
      });
    const sync = () => {
      try {
        setSaved(JSON.parse(localStorage.getItem("jdm:saved") || "[]"));
      } catch {
        setSaved([]);
      }
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("jdm:saved-change", sync);
    return () => {
      active = false;
      window.removeEventListener("storage", sync);
      window.removeEventListener("jdm:saved-change", sync);
    };
  }, []);

  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(
      `/search?${new URLSearchParams({ purpose: purpose === "invest" ? "sale" : purpose, ...(propertyType ? { type: propertyType } : {}), ...(query.trim() ? { q: query.trim() } : {}) })}`,
    );
  }
  function toggleSaved(id: string) {
    const next = saved.includes(id)
      ? saved.filter((item) => item !== id)
      : [...saved, id];
    setSaved(next);
    localStorage.setItem("jdm:saved", JSON.stringify(next));
    window.dispatchEvent(new Event("jdm:saved-change"));
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#20241f] pb-20 md:pb-0">
      <section className="relative overflow-hidden bg-[#17251f] text-white">
        <img
          src="/images/gurugram-residences.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover opacity-45 lg:hidden"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_35%,rgba(188,155,98,.25),transparent_42%),linear-gradient(100deg,rgba(23,37,31,.97)_0%,rgba(23,37,31,.88)_48%,rgba(23,37,31,.62)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 hidden h-[410px] w-[48%] opacity-30 lg:block"
        >
          <div className="absolute bottom-0 right-[18%] h-[78%] w-[24%] border-x border-white/20 bg-white/[.04] [clip-path:polygon(14%_0,100%_12%,100%_100%,0_100%)]" />
          <div className="absolute bottom-0 right-[4%] h-[56%] w-[22%] border-x border-white/20 bg-white/[.06] [clip-path:polygon(0_10%,84%_0,100%_100%,0_100%)]" />
          <div className="absolute bottom-0 right-[40%] h-[48%] w-[20%] border-x border-white/20 bg-white/[.04] [clip-path:polygon(0_0,100%_16%,100%_100%,0_100%)]" />
        </div>
        <header className="relative z-10 mx-auto flex max-w-[1320px] items-center justify-between px-3 py-4 sm:px-4 lg:px-10 lg:py-6">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="JDM Real Estate home"
          >
            <img src="/jdm-mark.svg" alt="" className="size-11" />
            <span>
              <strong className="block text-[17px] tracking-[.08em]">
                JDM{" "}
                <span className="font-normal text-[#d5bd8e]">REAL ESTATE</span>
              </strong>
              <span className="block text-[8px] uppercase tracking-[.19em] text-white/55">
                Gurugram · Local expertise
              </span>
            </span>
          </Link>
          <nav
            className="hidden items-center gap-7 text-[12px] font-medium text-white/75 lg:flex"
            aria-label="Main navigation"
          >
            <Link href="/search?purpose=sale">Buy</Link>
            <Link href="/search?purpose=rent">Rent</Link>
            <Link href="/search?type=commercial">Commercial</Link>
            <Link href="/search">Locations</Link>
            <Link href="/compare">Investment</Link>
            <Link href="/saved">Saved homes</Link>
            <Link href="/post">Sell property</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="hidden border border-[#d5bd8e] px-4 py-2.5 text-xs font-semibold text-[#e4d5b7] transition hover:bg-[#d5bd8e] hover:text-[#17251f] sm:block"
            >
              Explore homes
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex size-10 items-center justify-center border border-white/25 lg:hidden"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {menuOpen && (
            <nav
              aria-label="Mobile navigation"
              className="absolute inset-x-4 top-[calc(100%-4px)] z-30 flex flex-col border border-[#e8e1d4] bg-[#fbfaf7] p-2 text-sm font-semibold text-[#27352e] shadow-xl lg:hidden"
            >
              {[
                ["Buy", "/search?purpose=sale"],
                ["Rent", "/search?purpose=rent"],
                ["Commercial", "/search?type=commercial"],
                ["Explore locations", "/search"],
                ["Saved homes", "/saved"],
                ["Sell your property", "/post"],
                ["Sign in", "/login"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  onClick={() => setMenuOpen(false)}
                  href={href}
                  className="px-4 py-3 hover:bg-[#f0eee7]"
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </header>
        <div className="relative mx-auto grid min-h-[400px] max-w-[1320px] items-center px-5 pb-24 pt-8 sm:min-h-[440px] sm:px-8 sm:pb-28 lg:min-h-[540px] lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-32 lg:pt-4">
          <div className="relative z-10 max-w-[650px]">
            <p className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.24em] text-[#e2c99b]">
              <span className="h-px w-7 bg-[#d5bd8e]" />
              A better way to find your place
            </p>
            <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-.035em] sm:text-6xl lg:text-[70px]">
              Find a property
              <br />
              that moves{" "}
              <em className="font-normal text-[#d5bd8e]">you forward.</em>
            </h1>
            <p className="mt-5 max-w-[460px] text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
              Discover homes, commercial spaces and investment opportunities
              across Gurugram with local guidance at every step.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/search"
              className="inline-flex min-h-12 items-center gap-2 bg-[#d5bd8e] px-5 text-xs font-bold text-[#202b24] shadow-[0_8px_24px_rgba(0,0,0,.16)] hover:bg-[#e4d3b4]"
              >
                Explore properties <ArrowRight size={15} />
              </Link>
              <Link
                href="/post"
              className="inline-flex min-h-12 items-center border border-white/30 px-5 text-xs font-semibold text-white hover:border-white/60 hover:bg-white/10"
              >
                List a property
              </Link>
            </div>
          </div>
          <div className="hidden justify-end lg:flex">
            <div className="relative mr-10 h-[350px] w-[390px] overflow-hidden border border-white/25 shadow-[0_28px_80px_rgba(0,0,0,.24)]">
              <img src="/images/gurugram-residences.png" alt="Modern residences surrounded by greenery" fetchPriority="high" className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17251f]/65 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-5 border border-[#d5bd8e]/60 bg-[#202d26] px-5 py-4">
                <p className="text-[9px] uppercase tracking-[.19em] text-[#d5bd8e]">
                  Your next chapter
                </p>
                <p className="mt-1 font-serif text-xl">
                  Starts with the right address.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="relative z-10 mx-auto -mt-10 max-w-[1240px] px-4 sm:-mt-12 sm:px-8 lg:px-10">
        <div className="border border-[#e8e3d8] bg-[#fffefa] p-4 shadow-[0_18px_45px_rgba(30,39,32,.13)] sm:p-6">
          <div
            className="mb-3 flex gap-1"
            role="group"
            aria-label="Property purpose"
          >
            {[
              ["sale", "Buy"],
              ["rent", "Rent"],
              ["invest", "Invest"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => setPurpose(value)}
                aria-pressed={purpose === value}
                className={`min-h-10 px-4 text-xs font-semibold ${purpose === value ? "bg-[#ece8dd] text-[#27362d]" : "text-[#778078]"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <form
            onSubmit={search}
            className="grid gap-2 sm:grid-cols-[1fr_190px_120px]"
          >
            <label className="flex min-h-12 items-center gap-2 border border-[#e4e1d8] px-3">
              <MapPin size={17} className="text-[#967a4e]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Location"
                placeholder="Locality, sector or landmark"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#92958d]"
              />
            </label>
            <select
              aria-label="Property category"
              className="min-h-12 border border-[#e4e1d8] bg-white px-3 text-sm text-[#657068]"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="">Any property type</option>
              <option value="apartment">Apartments</option>
              <option value="builder-floor">Builder floors</option>
              <option value="commercial">Commercial</option>
            </select>
            <button className="flex min-h-12 items-center justify-center gap-2 bg-[#26372e] px-5 text-sm font-semibold text-white">
              <Search size={17} />
              Search
            </button>
          </form>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-[#788178]">
            <ShieldCheck size={15} className="text-[#987c50]" /> Property
            details are shown as provided and reviewed.
          </div>
        </div>
      </div>
      <section className="mx-auto max-w-[1240px] px-4 pt-12 sm:px-8 sm:pt-16 lg:px-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#967a4e]">
              Find your fit
            </p>
            <h2 className="mt-2 font-serif text-3xl font-medium tracking-[-.025em] sm:text-4xl">
              Explore by property type
            </h2>
          </div>
          <Link
            href="/search"
            className="hidden items-center gap-2 text-xs font-semibold text-[#33463a] sm:flex"
          >
            All properties <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, i) => (
            <Link
              key={category}
              href={`/search?${new URLSearchParams({ type: ["apartment", "builder-floor", "villa", "plot", "commercial", "commercial"][i] })}`}
              className="group flex min-h-[100px] flex-col justify-between border border-[#e7e2d7] bg-[#fffefa] p-3 transition duration-200 hover:-translate-y-0.5 hover:border-[#b8a078] hover:shadow-[0_10px_26px_rgba(38,48,38,.08)] sm:min-h-[120px] sm:p-4"
            >
              <span className="flex size-8 items-center justify-center bg-[#f1eee6] text-[#8e744d] transition-colors group-hover:bg-[#e8edd5] group-hover:text-[#40583a]">
                <Building2 size={16} />
              </span>
              <span className="text-xs font-semibold leading-5">
                {category}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-[1240px] px-4 pt-12 sm:px-8 sm:pt-16 lg:px-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#967a4e]">
              Local knowledge
            </p>
            <h2 className="mt-2 font-serif text-3xl font-medium tracking-[-.025em] sm:text-4xl">
              Explore Gurugram
            </h2>
          </div>
          <Link
            href="/search"
            className="hidden items-center gap-2 text-xs font-semibold text-[#33463a] sm:flex"
          >
            Explore locations <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-5 flex gap-3 overflow-x-auto sm:grid sm:grid-cols-3">
          {localities.map((place, i) => (
            <Link
              href={`/search?q=${encodeURIComponent(place.name)}`}
              key={place.name}
              className={`group relative min-h-[170px] min-w-[210px] overflow-hidden bg-gradient-to-br ${place.tone} sm:min-h-[280px]`}
            >
              <img src={place.image} alt={`Representative property image for ${place.name}`} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105" />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[80%] opacity-40"
              >
                <div className="absolute bottom-0 left-[10%] h-[68%] w-[30%] border-x border-white/40 bg-black/15 [clip-path:polygon(15%_0,100%_12%,100%_100%,0_100%)]" />
                <div className="absolute bottom-0 left-[46%] h-[90%] w-[27%] border-x border-white/40 bg-black/20 [clip-path:polygon(0_12%,70%_0,100%_100%,0_100%)]" />
                <div className="absolute bottom-0 right-[4%] h-[55%] w-[25%] border-x border-white/40 bg-black/15 [clip-path:polygon(10%_0,100%_14%,100%_100%,0_100%)]" />
                <div
                  className={`absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_36px,rgba(255,255,255,.22)_37px_39px)] ${i === 1 ? "opacity-70" : "opacity-45"}`}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#142019]/85 via-transparent to-transparent" />
              <div className="absolute inset-x-4 bottom-4 text-white sm:inset-x-5 sm:bottom-5">
                <p className="font-serif text-xl">{place.name}</p>
                <p className="mt-1 text-xs text-white/75">{place.note}</p>
                <span className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#e0ccaa]">
                  Explore <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-[1240px] px-4 pt-12 sm:px-8 sm:pt-16 lg:px-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#967a4e]">
              {status === "sample" ? "Example listings" : "Recently listed"}
            </p>
            <h2 className="mt-2 font-serif text-3xl font-medium tracking-[-.025em] sm:text-4xl">
              Properties to consider
            </h2>
          </div>
          <Link
            href="/search"
            className="flex items-center gap-1 text-xs font-semibold text-[#33463a]"
          >
            View search <ArrowRight size={15} />
          </Link>
        </div>
        {status === "loading" ? (
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse bg-[#e9e5dc]" />
            ))}
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {listings.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden border border-[#e7e2d7] bg-[#fffefa] shadow-[0_5px_18px_rgba(34,43,34,.035)] transition duration-200 hover:-translate-y-1 hover:border-[#d2c9b5] hover:shadow-[0_16px_34px_rgba(34,43,34,.11)]"
              >
                <Link
                  href={`/property/${item.id}`}
                  className="relative block h-36 overflow-hidden bg-[#e4e3db] sm:h-48"
                >
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      loading="lazy"
                      className="size-full object-cover transition duration-500 group-hover:scale-[1.035]"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-[#97866a]">
                      <Building2 size={34} />
                    </div>
                  )}
                  {item.sample ? (
                    <span className="absolute left-2 top-2 bg-[#fffefa]/95 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#6b5636]">Example · not live</span>
                  ) : item.verifiedAt && (
                    <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/95 px-2 py-1 text-[9px] font-bold text-[#405848]">
                      <Check size={12} />
                      Reviewed
                    </span>
                  )}
                </Link>
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between gap-1">
                    <Link
                      href={`/property/${item.id}`}
                      className="line-clamp-1 text-sm font-semibold"
                    >
                      {item.title}
                    </Link>
                    <button
                      disabled={item.sample}
                      onClick={() => toggleSaved(item.id)}
                      aria-label={
                        saved.includes(item.id)
                          ? "Remove saved property"
                          : item.sample ? "Example listing cannot be saved" : "Save property"
                      }
                      aria-pressed={saved.includes(item.id)}
                      className="flex size-7 shrink-0 items-center justify-center text-[#7f735f] disabled:opacity-35"
                    >
                      <Heart
                        size={16}
                        fill={saved.includes(item.id) ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                  <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-[#788078]">
                    <MapPin size={12} />
                    {item.locality}
                  </p>
                  <p className="mt-3 text-sm font-bold text-[#34463a]">
                    {price(item.price, item.purpose)}
                  </p>
                  <p className="mt-2 border-t border-[#eeeae2] pt-2 text-[10px] text-[#737a72]">
                    {item.bedrooms ? `${item.bedrooms} bedroom · ` : ""}
                    {item.area
                      ? `${item.area.toLocaleString("en-IN")} sq ft`
                      : item.type.replaceAll("-", " ")}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="mx-auto max-w-[1240px] px-4 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-10">
        <div className="grid gap-6 bg-[#eae5d9] p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-10">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#967a4e]">
              For property owners
            </p>
            <h2 className="mt-2 font-serif text-3xl font-medium">
              Your property deserves
              <br className="hidden sm:block" /> the right buyer.
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[#687168]">
              Share the details with our team. Every submission enters a review
              queue before it can appear publicly.
            </p>
          </div>
          <Link
            href="/post"
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#26372e] px-5 text-xs font-semibold text-white"
          >
            List your property <ArrowRight size={15} />
          </Link>
        </div>
      </section>
      <footer className="bg-[#17251f] px-5 py-8 text-white sm:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[.1em]">
              JDM REAL ESTATE
            </p>
            <p className="mt-1 text-xs text-white/55">
              Your property. Our local expertise.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
            <Link href="/search">Explore</Link>
            <Link href="/post">List property</Link>
            <Link href="/saved">Saved</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-[1240px] border-t border-white/15 pt-4 text-[10px] text-white/45">
          Property information is subject to owner confirmation. JDM Real Estate
          · Gurugram, Haryana
        </p>
      </footer>
      <BottomNav />
    </main>
  );
}
