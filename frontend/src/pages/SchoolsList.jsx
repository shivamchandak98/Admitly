import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useCity } from "@/context/CityContext";
import SchoolCard from "@/components/SchoolCard";
import CitySwitcher from "@/components/CitySwitcher";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Search, Filter, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const FACILITIES = [
  { key: "sports", label: "Sports" },
  { key: "music", label: "Music" },
  { key: "digital", label: "Digital Learning" },
  { key: "drama", label: "Drama" },
  { key: "swimming", label: "Swimming" },
  { key: "library", label: "Library" },
  { key: "art", label: "Art" },
];

export default function SchoolsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { city } = useCity();
  const [schools, setSchools] = useState([]);
  const [meta, setMeta] = useState({ areas: [], boards: [] });
  const [favIds, setFavIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") || "";
  const area = searchParams.get("area") || "";
  const board = searchParams.get("board") || "";
  const facility = searchParams.get("facility") || "";
  const feesMax = searchParams.get("fees_max") || "";
  const openOnly = searchParams.get("admission_open") === "true";

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "all" && value !== "") next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const loadFavs = useCallback(async () => {
    if (!user) return;
    try {
      const r = await api.get("/favourites/ids");
      setFavIds(r.data.ids);
    } catch {}
  }, [user]);

  useEffect(() => {
    api.get("/schools/meta", { params: { city } }).then((r) => setMeta(r.data)).catch(() => {});
  }, [city]);

  useEffect(() => {
    loadFavs();
  }, [loadFavs]);

  useEffect(() => {
    setLoading(true);
    const params = { city };
    if (search) params.search = search;
    if (area) params.area = area;
    if (board) params.board = board;
    if (facility) params.facility = facility;
    if (feesMax) params.fees_max = Number(feesMax);
    if (openOnly) params.admission_open = true;
    api.get("/schools", { params })
      .then((r) => setSchools(r.data))
      .finally(() => setLoading(false));
  }, [city, search, area, board, facility, feesMax, openOnly]);

  const toggleFav = async (school_id) => {
    if (!user) {
      toast.info("Sign in to save favourites");
      return;
    }
    const isFav = favIds.includes(school_id);
    if (isFav) {
      await api.delete(`/favourites/${school_id}`);
      setFavIds(favIds.filter((id) => id !== school_id));
      toast.success("Removed from favourites");
    } else {
      await api.post(`/favourites/${school_id}`);
      setFavIds([...favIds, school_id]);
      toast.success("Added to favourites");
    }
  };

  const activeFilterCount = [area, board, facility, feesMax, openOnly ? "open" : ""].filter(Boolean).length;

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs tracking-[0.2em] uppercase font-semibold text-gray-500 mb-3">Browse {city}</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }} data-testid="schools-page-title">
              All schools
            </h1>
            <p className="text-gray-600 mt-3">Filter by area, fees, board and facilities. Save your favourites to track them.</p>
          </div>
          <CitySwitcher />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-20" data-testid="filters-panel">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-700" />
                  <span className="font-semibold text-gray-900">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#E07A5F] text-white">{activeFilterCount}</span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => setSearchParams(new URLSearchParams(search ? { search } : {}))}
                    className="text-xs text-gray-500 hover:text-[#E07A5F] flex items-center gap-1"
                    data-testid="clear-filters"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <div className="text-xs tracking-[0.15em] uppercase font-semibold text-gray-500 mb-2">Search</div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={search}
                      onChange={(e) => setParam("search", e.target.value)}
                      placeholder="Search school or area"
                      className="pl-9 rounded-xl"
                      data-testid="filter-search-input"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-xs tracking-[0.15em] uppercase font-semibold text-gray-500 mb-2">Area</div>
                  <Select value={area || "all"} onValueChange={(v) => setParam("area", v)}>
                    <SelectTrigger className="rounded-xl" data-testid="filter-area">
                      <SelectValue placeholder="All areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All areas</SelectItem>
                      {meta.areas.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="text-xs tracking-[0.15em] uppercase font-semibold text-gray-500 mb-2">Board</div>
                  <Select value={board || "all"} onValueChange={(v) => setParam("board", v)}>
                    <SelectTrigger className="rounded-xl" data-testid="filter-board">
                      <SelectValue placeholder="All boards" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All boards</SelectItem>
                      {meta.boards.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="text-xs tracking-[0.15em] uppercase font-semibold text-gray-500 mb-2">Facility</div>
                  <Select value={facility || "all"} onValueChange={(v) => setParam("facility", v)}>
                    <SelectTrigger className="rounded-xl" data-testid="filter-facility">
                      <SelectValue placeholder="Any facility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any facility</SelectItem>
                      {FACILITIES.map((f) => (
                        <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="text-xs tracking-[0.15em] uppercase font-semibold text-gray-500 mb-2">
                    Max fees: {feesMax ? `₹${(Number(feesMax) / 100000).toFixed(1)}L / yr` : "Any"}
                  </div>
                  <Slider
                    value={[feesMax ? Number(feesMax) : 2000000]}
                    min={50000}
                    max={2000000}
                    step={50000}
                    onValueChange={(v) => setParam("fees_max", v[0])}
                    data-testid="filter-fees"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm font-medium text-gray-700">Admissions open only</div>
                  <Switch
                    checked={openOnly}
                    onCheckedChange={(v) => setParam("admission_open", v ? "true" : "")}
                    data-testid="filter-open"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="lg:col-span-9">
            <div className="flex items-center justify-between mb-5">
              <div className="text-sm text-gray-600" data-testid="results-count">
                {loading ? "Loading…" : `${schools.length} schools found`}
              </div>
            </div>
            {!loading && schools.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <p className="text-gray-700 font-medium">No schools match your filters.</p>
                <Button
                  variant="outline"
                  onClick={() => setSearchParams({})}
                  className="mt-4 rounded-xl"
                  data-testid="reset-filters"
                >
                  Reset filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {schools.map((s) => (
                  <SchoolCard
                    key={s.school_id}
                    school={s}
                    isFavourite={favIds.includes(s.school_id)}
                    onToggleFavourite={toggleFav}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
