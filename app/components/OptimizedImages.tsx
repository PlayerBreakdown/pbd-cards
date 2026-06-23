import Image from "next/image";

type CardArtProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function CardArt({
  src,
  alt,
  className = "w-full rounded-lg border border-white/10",
  sizes = "(min-width: 1024px) 360px, 90vw",
  priority = false,
}: CardArtProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1024}
      height={1536}
      sizes={sizes}
      priority={priority}
      unoptimized
      decoding="async"
      className={className}
    />
  );
}

type PlayerFaceProps = {
  src: string | null;
  alt: string;
  size: number;
  className: string;
  placeholderClassName?: string;
};

export function PlayerFace({
  src,
  alt,
  size,
  className,
  placeholderClassName,
}: PlayerFaceProps) {
  if (!src) {
    return (
      <div
        className={placeholderClassName ?? className}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      sizes={`${size}px`}
      decoding="async"
      className={className}
    />
  );
}
