/** Beaches that have a real photo in public/beaches/<id>.webp. */
const WITH_PHOTO = new Set([
  "haeundae",
  "gwangalli",
  "songjeong",
  "songdo",
  "dadaepo",
  "ilgwang",
]);

export function hasBeachPhoto(id: string): boolean {
  return WITH_PHOTO.has(id);
}

/** Public path to a beach's photo (stored in `public/beaches/<id>.webp`). */
export function beachPhotoSrc(id: string): string {
  return `/beaches/${id}.webp`;
}
