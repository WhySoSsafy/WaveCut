import { getAllSummaries } from "@/lib/api/aggregate";
import { FavoritesList } from "@/components/mobile/FavoritesList";

export default async function FavoritesPage() {
  const beaches = await getAllSummaries();
  return <FavoritesList beaches={beaches} />;
}
