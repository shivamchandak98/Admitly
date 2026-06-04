import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useCity } from "@/context/CityContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Sparkles, FileCheck2, BellRing, ListChecks, Trophy, Music, Cpu, Palette, BookOpen, Star } from "lucide-react";
import SchoolCard from "@/components/SchoolCard";
import CitySwitcher from "@/components/CitySwitcher";

const HOLISTIC = [
  { icon: BookOpen, label: "Academics", color: "#E07A5F" },
  { icon: Trophy, label: "Sports", color: "#4CAF50" },
  { icon: Music, label: "Music", color: "#8AB4F8" },
  { icon: Palette, label: "Arts", color: "#FFB347" },
  { icon: Cpu, label: "Digital", color: "#9F7AEA" },
];

const POPULAR_AREAS = {
  Mumbai: [
    { name: "Bandra Kurla Complex", emoji: "🏙" },
    { name: "Juhu", emoji: "🌴" },
    { name: "Powai", emoji: "🏞" },
    { name: "Thane", emoji: "🌆" },
    { name: "Andheri East", emoji: "✈" },
    { name: "Fort", emoji: "🏛" },
  ],
  Bangalore: [
    { name: "Indiranagar", emoji: "🌳" },
    { name: "Whitefield", emoji: "💻" },
    { name: "Koramangala", emoji: "☕" },
    { name: "Yelahanka", emoji: "🌿" },
    { name: "JP Nagar", emoji: "🏘" },
    { name: "Sarjapur", emoji: "🛣" },
  ],
  Delhi: [
    { name: "Chanakyapuri", emoji: "🏛" },
    { name: "Vasant Kunj", emoji: "🌆" },
    { name: "RK Puram", emoji: "🏙" },
    { name: "Lodi Estate", emoji: "🌿" },
    { name: "Pitampura", emoji: "🏘" },
    { name: "Barakhamba Road", emoji: "🛣" },
  ],
  Noida: [
    { name: "Sector 30, Noida", emoji: "🌆" },
    { name: "Sector 44, Noida", emoji: "🏙" },
    { name: "Sector 126, Noida", emoji: "🏘" },
    { name: "Sector 132, Noida", emoji: "🌿" },
  ],
  Gurgaon: [
    { name: "Sector 57, Gurgaon", emoji: "🏙" },
    { name: "Sohna Road, Gurgaon", emoji: "🛣" },
    { name: "Aravali Hills, Gurgaon", emoji: "⛰" },
    { name: "Sector 27, Gurgaon", emoji: "🌆" },
  ],
};

export default function Landing() {
  const navigate = useNavigate();
  const { city } = useCity();
  const [search, setSearch] = useState("");
  const [topSchools, setTopSchools] = useState([]);
  const [openSchools, setOpenSchools] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    api.get("/schools", { params: { city, sort: "rating", limit: 9 } })
      .then((r) => setTopSchools(r.data))
      .catch(() => setTopSchools([]));
    api.get("/schools", { params: { city, admission_open: true, sort: "rating", limit: 6 } })
      .then((r) => setOpenSchools(r.data))
      .catch(() => setOpenSchools([]));
    api.get("/schools", { params: { city } })
      .then((r) => setTotalCount(r.data.length))
      .catch(() => {});
  }, [city]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/schools${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  };

  const areas = POPULAR_AREAS[city] || [];

  return (
    <div className="bg-[#FAFAF8]">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          <div className="md:col-span-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="text-xs tracking-[0.2em] uppercase font-semibold text-[#E07A5F]" data-testid="hero-eyebrow">
                {city} · {totalCount || "—"} schools
              </div>
              <span className="text-gray-300">•</span>
              <CitySwitcher compact />
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-none text-gray-900"
              style={{ fontFamily: "Outfit, sans-serif" }}
              data-testid="hero-title"
            >
              School admissions in <span className="italic text-[#E07A5F]">{city}</span>, finally stress-free.
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-xl leading-relaxed">
              Discover schools that nurture the whole child — academics, sports, music and the arts. Compare, shortlist and track every step in one calm dashboard.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex items-center gap-2 bg-white border border-gray-200 rounded-2xl p-2 max-w-xl" data-testid="hero-search-form">
              <Search className="w-5 h-5 text-gray-400 ml-3" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Try a school name, area or 'ICSE'…`}
                className="border-0 shadow-none focus-visible:ring-0 text-base"
                data-testid="hero-search-input"
              />
              <Button
                type="submit"
                className="rounded-xl bg-[#1F2937] hover:bg-[#E07A5F] text-white px-5 transition-colors duration-200"
                data-testid="hero-search-button"
              >
                Search <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>

            <div className="mt-7 flex flex-wrap items-center gap-2">
              {HOLISTIC.map((h) => (
                <div
                  key={h.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-800"
                  data-testid={`pillar-${h.label.toLowerCase()}`}
                >
                  <h.icon className="w-3.5 h-3.5" style={{ color: h.color }} strokeWidth={2} />
                  {h.label}
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className="relative h-[440px]">
              <img
                src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80&auto=format&fit=crop"
                alt="Indian school children"
                className="absolute right-0 top-0 w-[78%] h-[300px] object-cover rounded-3xl border border-gray-200 shadow-sm"
              />
              <img
                src="https://images.unsplash.com/photo-1774438026136-9736ec28922a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwYXJlbnQlMjBjaGlsZCUyMHN0dWR5aW5nJTIwdG9nZXRoZXIlMjBoYXBweXxlbnwwfHx8fDE3Nzg0OTc1NjJ8MA&ixlib=rb-4.1.0&q=85"
                alt="Indian parent and child"
                className="absolute left-0 bottom-0 w-[60%] h-[240px] object-cover rounded-3xl border border-gray-200 shadow-lg"
              />
              <div className="absolute right-4 bottom-6 bg-white rounded-2xl border border-gray-200 p-4 shadow-lg w-[240px]">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gray-500 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" /> Today's reminder
                </div>
                <p className="mt-2 text-sm font-semibold text-gray-900 leading-snug">
                  Aarav's interview at Cathedral — <span className="text-[#E07A5F]">in 3 days</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOP RATED SCHOOLS */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs tracking-[0.2em] uppercase font-semibold text-gray-500 mb-3 flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-[#FFB347] fill-[#FFB347]" /> Top rated in {city}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 max-w-2xl" style={{ fontFamily: "Outfit, sans-serif" }}>
              The schools parents love the most
            </h2>
            <p className="text-gray-600 mt-3 max-w-xl">Ranked by Google reviews. Surf the city's best without filling a single form.</p>
          </div>
          <Link to="/schools?sort=rating" className="inline-flex items-center text-sm font-semibold text-[#E07A5F] hover:text-[#C96349]" data-testid="see-all-top">
            See all {totalCount} schools <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {topSchools.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            No schools in {city} yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="top-schools-grid">
            {topSchools.map((s) => (
              <SchoolCard key={s.school_id} school={s} />
            ))}
          </div>
        )}
      </section>

      {/* BROWSE BY AREA */}
      {areas.length > 0 && (
        <section className="border-y border-gray-200/70 bg-[#F0F4F1]/40">
          <div className="max-w-7xl mx-auto px-6 md:px-8 py-14 md:py-20">
            <div className="text-xs tracking-[0.2em] uppercase font-semibold text-gray-500 mb-3">Surf by neighbourhood</div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 max-w-2xl" style={{ fontFamily: "Outfit, sans-serif" }}>
              Find a school closer to home
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-10">
              {areas.map((a) => (
                <button
                  key={a.name}
                  onClick={() => navigate(`/schools?area=${encodeURIComponent(a.name)}`)}
                  className="bg-white rounded-2xl border border-gray-200 p-5 text-left hover:-translate-y-1 hover:shadow-lg transition-transform duration-200"
                  data-testid={`area-tile-${a.name}`}
                >
                  <div className="text-2xl mb-2">{a.emoji}</div>
                  <div className="font-semibold text-gray-900 text-sm leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
                    {a.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    Explore <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ADMISSIONS OPEN NOW */}
      {openSchools.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-8 py-14 md:py-20">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="text-xs tracking-[0.2em] uppercase font-semibold text-[#4CAF50] mb-3">● Admissions open</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 max-w-2xl" style={{ fontFamily: "Outfit, sans-serif" }}>
                Applying right now in {city}
              </h2>
            </div>
            <Link to="/schools?admission_open=true" className="inline-flex items-center text-sm font-semibold text-[#E07A5F]" data-testid="see-all-open">
              See all open admissions <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {openSchools.map((s) => (
              <SchoolCard key={s.school_id} school={s} />
            ))}
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="border-t border-gray-200/70 bg-[#F0F4F1]/40">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <div className="text-xs tracking-[0.2em] uppercase font-semibold text-gray-500 mb-4">How Admitly helps</div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 max-w-2xl" style={{ fontFamily: "Outfit, sans-serif" }}>
            Three calmer steps. From shortlist to acceptance letter.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              { icon: ListChecks, title: "Shortlist with confidence", body: "Filter schools by area, fees, board, sports, music and digital learning facilities.", testid: "step-shortlist" },
              { icon: FileCheck2, title: "Track each application", body: "Upload documents, set deadlines and interview dates — every detail in a clean per-child tracker.", testid: "step-track" },
              { icon: BellRing, title: "Never miss a date", body: "Set reminders for form deadlines and interviews. We turn admission chaos into clarity.", testid: "step-remind" },
            ].map(({ icon: Icon, title, body, testid }, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-8 transition-transform duration-200 hover:-translate-y-1" data-testid={testid}>
                <div className="w-12 h-12 rounded-2xl bg-[#E07A5F]/10 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-[#E07A5F]" strokeWidth={1.75} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Your child's admission journey, on one calm page.
            </h2>
            <p className="text-gray-600 mt-4 max-w-xl">
              Sign in with Google. Add your shortlist. Track every status. Free to use.
            </p>
            <Link to="/schools">
              <Button className="mt-8 rounded-full bg-[#E07A5F] hover:bg-[#C96349] text-white px-7 h-12 text-base" data-testid="cta-browse-schools">
                Start browsing schools <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="md:col-span-5">
            <img
              src="https://images.pexels.com/photos/26796497/pexels-photo-26796497.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
              alt="Calm pastel"
              className="rounded-3xl border border-gray-200 w-full h-[260px] object-cover"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Admitly · School Admissions across India
      </footer>
    </div>
  );
}
