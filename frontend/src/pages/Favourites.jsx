import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import SchoolCard from "@/components/SchoolCard";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";

export default function Favourites() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [favs, setFavs] = useState([]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) api.get("/favourites").then((r) => setFavs(r.data)).catch(() => {});
  }, [user]);

  const remove = async (id) => {
    await api.delete(`/favourites/${id}`);
    setFavs(favs.filter((s) => s.school_id !== id));
    toast.success("Removed from favourites");
  };

  if (!user) return null;

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        <div className="mb-8">
          <div className="text-xs tracking-[0.2em] uppercase font-semibold text-gray-500 mb-3">Your shortlist</div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }} data-testid="favourites-title">
            Favourite schools
          </h1>
        </div>

        {favs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Heart className="w-12 h-12 mx-auto text-[#E07A5F] mb-4" />
            <p className="font-semibold text-gray-900">No favourites yet</p>
            <p className="text-gray-600 mt-1">Tap the heart on any school card to save it here.</p>
            <Link to="/schools">
              <Button className="mt-5 rounded-xl bg-[#E07A5F] hover:bg-[#C96349] text-white" data-testid="empty-fav-browse">
                Browse schools
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favs.map((s) => (
              <SchoolCard key={s.school_id} school={s} isFavourite={true} onToggleFavourite={remove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
