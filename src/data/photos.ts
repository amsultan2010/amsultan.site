export interface Photo {
  id: string;
  src: string;
  thumb: string;
  alt: string;
  caption?: string;
}

const COUNT = 21;

export const photos: Photo[] = Array.from({ length: COUNT }, (_, i) => {
  const n = i + 1;
  const file = `/images/gallery/image${n}.jpg`;
  return {
    id: `image${n}`,
    src: file,
    thumb: file,
    alt: `photo ${n}`,
  };
});
