"use client";

import { useFavorites } from "./FavoritesProvider";
import { Icon } from "@/components/shared/Icon";
import styles from "./mobile.module.css";

interface FavoriteButtonProps {
  id: string;
  size?: number;
}

export function FavoriteButton({ id, size = 20 }: FavoriteButtonProps) {
  const { toggle, isFavorite } = useFavorites();
  const active = isFavorite(id);

  function handleClick(e: React.MouseEvent) {
    // Prevent the parent <Link> from navigating when the button is clicked
    e.preventDefault();
    e.stopPropagation();
    toggle(id);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      className={styles.aFavBtn}
    >
      <Icon
        name="star"
        size={size}
        color={active ? "var(--caution, #F59E0B)" : "var(--ink-3, #94A3B8)"}
      />
    </button>
  );
}
