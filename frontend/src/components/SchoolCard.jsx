import { Link } from "react-router-dom";
import { Star, MapPin, IndianRupee, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FACILITY_LABELS = {
  sports: "Sports",
  music: "Music",
  digital: "Digital",
  drama: "Drama",
  swimming: "Swimming",
  library: "Library",
  art: "Art",
};

function formatFees(min, max) {
  const fmt = (n) => {
    if (n >= 100000) return `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
    return `${(n / 1000).toFixed(0)}k`;
  };
  return `₹${fmt(min)} – ₹${fmt(max)}`;
}

export default function SchoolCard({ school, isFavourite, onToggleFavourite }) {
  return (
    <div
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
      data-testid={`school-card-${school.school_id}`}
    >
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <img
          src={school.image}
          alt={school.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {school.admission_open && (
          <Badge className="absolute top-3 left-3 bg-[#4CAF50] hover:bg-[#4CAF50] text-white border-0 rounded-full">
            Admissions Open
          </Badge>
        )}
        {onToggleFavourite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavourite(school.school_id);
            }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition"
            data-testid={`favourite-toggle-${school.school_id}`}
          >
            <Heart className={`w-4 h-4 ${isFavourite ? "fill-[#E07A5F] text-[#E07A5F]" : "text-gray-700"}`} strokeWidth={2} />
          </button>
        )}
      </div>

      <Link to={`/schools/${school.school_id}`} className="block p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 leading-snug" style={{ fontFamily: "Outfit, sans-serif" }}>
            {school.name}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
          <MapPin className="w-3.5 h-3.5" />
          {school.area}{school.city ? `, ${school.city}` : ""} · <span className="text-gray-700 font-medium">{school.board}</span>
        </div>

        <div className="flex items-center gap-3 mb-3 text-sm">
          <div className="flex items-center gap-1 font-semibold text-gray-900">
            <Star className="w-4 h-4 fill-[#FFB347] text-[#FFB347]" />
            {school.rating}
            <span className="text-gray-400 font-normal text-xs ml-0.5">({school.google_reviews_count?.toLocaleString?.("en-IN") || 0})</span>
          </div>
          {school.pass_percentage_10th != null && (
            <div className="text-xs text-gray-600 border-l border-gray-200 pl-3">
              <span className="font-semibold text-[#4CAF50]">{school.pass_percentage_10th}%</span> 10th pass
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-sm text-gray-700 mb-4">
          <IndianRupee className="w-3.5 h-3.5" />
          <span className="font-medium">{formatFees(school.fees_min, school.fees_max)}</span>
          <span className="text-gray-400">/ year</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {school.facilities.slice(0, 4).map((f) => (
            <span
              key={f}
              className="text-[11px] px-2 py-0.5 rounded-full bg-[#F0F4F1] text-gray-700 border border-gray-200"
            >
              {FACILITY_LABELS[f] || f}
            </span>
          ))}
          {school.facilities.length > 4 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F0F4F1] text-gray-500 border border-gray-200">
              +{school.facilities.length - 4}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
