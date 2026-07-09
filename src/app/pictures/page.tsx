import type { Metadata } from 'next';
import { photos } from '@/data/photos';
import PicturesClient from './PicturesClient';

export const metadata: Metadata = {
  title: 'Pictures',
  description: 'Photo gallery showcasing life, work, and travel moments',
};

export default function PicturesPage() {
  return <PicturesClient photos={photos} />;
}
