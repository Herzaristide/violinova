import Tuner from '@/components/tools/Tuner';
import { useTranslations } from 'next-intl';

export default function HomePage({ params: { locale } }: { params: any }) {
  const t = useTranslations('HomePage');
  return (
    <div className="w-full h-full">
      <Tuner />
    </div>
  );
}
