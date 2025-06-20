import React from 'react';
import RessourcesList from '@/components/ui/ressources/RessourcesList';
import {
  getRessources,
  getSession,
  getSubscription,
  getUserDetails
} from '@/app/supabase-server';

export default async function RessourcesPage({
  params: { locale, ressourceId }
}: {
  params: any;
}) {
  const [session, userDetails, subscription, ressources] = await Promise.all([
    getSession(),
    getUserDetails(),
    getSubscription(),
    getRessources()
  ]);

  return (
    <div className="flex md:hidden w-full h-full">
      {/* <RessourcesList
        ressources={ressources}
        subscription={subscription?.prices?.products?.name}
      /> */}
    </div>
  );
}
