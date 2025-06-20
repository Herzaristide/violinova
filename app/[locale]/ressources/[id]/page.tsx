import { getRessource } from '@/app/supabase-server';
import { unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import React from 'react';
import RessourceRender from '@/components/ui/ressources/RessourceRender';
import PreviouButton from '@/components/PreviousButton';

export default async function RessourcePage({
  params: { locale, id }
}: {
  params: any;
}) {
  unstable_setRequestLocale(locale);
  // const t = useTranslations('Ressources');
  const [ressource] = await Promise.all([getRessource(id)]);

  return (
    <div className="flex w-full h-full">
      {/* {ressource ? (
        <div className="flex flex-col w-full">
          <div className="flex w-full items-center gap-4 border-[#df744a] rounded-full border-2 border-solid text-[#eae1d6] text-[24px] p-2 pr-4">
            <PreviouButton />
            <h1 className=" capitalize truncate text-left">
              {ressource.title}
            </h1>
            <h1 className=" capitalize text-center">{ressource.difficulty}</h1>
          </div>
          <RessourceRender ressource={ressource} />
        </div> */}
      {/* ) : (
        <div className="flex flex-col w-full">
          <div className="flex w-fit items-center gap-4 border-[#df744a] rounded-full border-2 border-solid text-[#eae1d6] text-[24px] p-2 pr-4">
            <PreviouButton />
            <h1 className="capitalize truncate text-left">????????</h1>
            <h1 className="capitalize text-center">?????????</h1>
          </div>
          <h1>Hummm this ressource seems to be paid</h1>
          <Link href={'/pricing'}>Go to store</Link>
        </div>
      )} */}
    </div>
  );
}
