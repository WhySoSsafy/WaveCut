import Image from "next/image";
import { beachPhotoSrc, hasBeachPhoto } from "@/lib/data/beachPhoto";

/**
 * Beach photo that fills its (position:relative) container.
 * Falls back to an ocean gradient when no licensed photo exists for the beach
 * (e.g. 임랑 has no free Wikimedia image).
 */
export function BeachPhoto({
  id,
  alt,
  sizes,
  priority,
  className,
}: {
  id: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (hasBeachPhoto(id)) {
    return (
      <Image
        src={beachPhotoSrc(id)}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        style={{ objectFit: "cover" }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(160deg, #1c4d86, #2f86f0 70%, #39B7F0)",
      }}
    />
  );
}
