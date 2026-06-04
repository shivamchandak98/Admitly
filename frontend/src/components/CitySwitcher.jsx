import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useCity } from "@/context/CityContext";
import { MapPin, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CitySwitcher({ compact = false }) {
  const { city, setCity } = useCity();
  const [cities, setCities] = useState([]);

  useEffect(() => {
    api.get("/schools/cities").then((r) => setCities(r.data)).catch(() => {});
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-1.5 rounded-full border border-gray-200 bg-white hover:border-[#E07A5F] transition-colors duration-200 ${compact ? "px-3 py-1.5 text-sm" : "px-4 py-2"}`}
          data-testid="city-switcher-trigger"
        >
          <MapPin className="w-4 h-4 text-[#E07A5F]" />
          <span className="font-semibold text-gray-900">{city}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.18em] text-gray-500 font-semibold">Choose a city</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {cities.map((c) => (
          <DropdownMenuItem
            key={c.city}
            onClick={() => setCity(c.city)}
            className="flex items-center justify-between"
            data-testid={`city-option-${c.city}`}
          >
            <span className="flex items-center gap-2">
              {c.city === city && <Check className="w-3.5 h-3.5 text-[#E07A5F]" />}
              <span className={c.city === city ? "font-semibold" : ""}>{c.city}</span>
            </span>
            <span className="text-xs text-gray-500">{c.count}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
