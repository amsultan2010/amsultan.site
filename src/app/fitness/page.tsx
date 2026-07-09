import type { Metadata } from 'next';
import FitnessClient from './FitnessClient';
import runsData from '@/data/runs.json';
import liftsData from '@/data/lifts.json';

export const metadata: Metadata = {
  title: 'Fitness',
  description: 'Running and strength training progress tracking',
};

export default function FitnessPage() {
  return <FitnessClient runs={runsData} lifts={liftsData} />;
}
