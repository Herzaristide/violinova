import {
  getRessources,
  getSession,
  getSubscription,
  getUserDetails
} from '@/app/supabase-server';
import RessourcesList from '@/components/ui/ressources/RessourcesList';

export default async function RessourceLayout({
  children,
  params: { locale }
}: any) {
  // const t = useTranslations('Ressources');
  const [session, userDetails, subscription, ressources] = await Promise.all([
    getSession(),
    getUserDetails(),
    getSubscription(),
    getRessources()
  ]);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full h-full">
      {/* <RessourcesList
        ressources={ressources}
        subscription={subscription?.prices?.products?.name}
      /> */}
      {children}
    </div>
  );
}
