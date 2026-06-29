/** Public path to a beach's photo (stored in `public/beaches/<id>.webp`). */
export function beachPhotoSrc(id: string): string {
  return `/beaches/${id}.webp`;
}
