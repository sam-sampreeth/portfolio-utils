import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites.tsx";

interface FavoriteToggleProps {
    toolId: string;
    className?: string;
}

export default function FavoriteToggle({ toolId, className }: FavoriteToggleProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const favored = isFavorite(toolId);

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(toolId);
            }}
            className={cn(
                "p-2 rounded-full transition-all duration-300 group/fav",
                favored
                    ? "text-yellow-400 bg-yellow-400/10"
                    : "text-white/20 hover:text-white/40 hover:bg-white/5",
                className
            )}
            title={favored ? "Remove from favorites" : "Add to favorites"}
        >
            <Star
                size={18}
                className={cn(
                    "transition-transform duration-300",
                    favored ? "fill-current scale-110" : "scale-100 group-hover/fav:scale-110"
                )}
            />
        </button>
    );
}
