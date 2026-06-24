export interface Photo {
  id: string;
  src: string;
  thumb: string;
  alt: string;
  caption?: string;
}

export const photos: Photo[] = [
  { id: 'image1', src: '/images/gallery/image1.jpg', thumb: '/images/gallery/image1.jpg', alt: 'Gallery photo 1' },
  { id: 'image2', src: '/images/gallery/image2.jpg', thumb: '/images/gallery/image2.jpg', alt: 'Gallery photo 2' },
  { id: 'image3', src: '/images/gallery/image3.jpg', thumb: '/images/gallery/image3.jpg', alt: 'Gallery photo 3' },
  { id: 'image4', src: '/images/gallery/image4.jpg', thumb: '/images/gallery/image4.jpg', alt: 'Gallery photo 4' },
  { id: 'image5', src: '/images/gallery/image5.jpg', thumb: '/images/gallery/image5.jpg', alt: 'Gallery photo 5' },
  { id: 'image6', src: '/images/gallery/image6.jpg', thumb: '/images/gallery/image6.jpg', alt: 'Gallery photo 6' },
  { id: 'image7', src: '/images/gallery/image7.jpg', thumb: '/images/gallery/image7.jpg', alt: 'Gallery photo 7' },
  { id: 'image8', src: '/images/gallery/image8.jpg', thumb: '/images/gallery/image8.jpg', alt: 'Gallery photo 8' },
  { id: 'image9', src: '/images/gallery/image9.jpg', thumb: '/images/gallery/image9.jpg', alt: 'Gallery photo 9' },
  { id: 'image10', src: '/images/gallery/image10.jpg', thumb: '/images/gallery/image10.jpg', alt: 'Gallery photo 10' },
  { id: 'image11', src: '/images/gallery/image11.jpg', thumb: '/images/gallery/image11.jpg', alt: 'Gallery photo 11' },
  { id: 'image12', src: '/images/gallery/image12.jpg', thumb: '/images/gallery/image12.jpg', alt: 'Gallery photo 12' },
];
