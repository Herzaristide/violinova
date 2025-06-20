import { getCourse, getCourses } from '@/app/supabase-server';
import Link from 'next/link';
import React from 'react';
import CourseRender from '@/components/ui/courses/CourseRender';
import PreviouButton from '@/components/PreviousButton';

export default async function CoursePage({
  params: { locale, id }
}: {
  params: any;
}) {
  const [course] = await Promise.all([getCourse(id)]);

  return (
    <div className="flex w-full h-full">
      {course ? (
        <div className="flex flex-col w-full h-full">
          {/* <div className="flex md:w-full items-center gap-4 border-[#df744a] rounded-full border-2 border-solid text-[#eae1d6] text-auto md:text-[24px] p-2 pr-4">
            <PreviouButton />
            <h1 className="capitalize truncate text-left">{course.title}</h1>
            <h1 className="capitalize text-center">{course.difficulty}</h1>
          </div>
          <CourseRender
            course={locale == 'en' ? course.content_EN : course.content_FR}
          /> */}
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <div className="flex w-fit items-center gap-4 border-[#df744a] rounded-full border-2 border-solid text-[#eae1d6] text-[24px] p-2 pr-4">
            <PreviouButton />
            <h1 className="capitalize truncate text-left">????????</h1>
            <h1 className="capitalize text-center">?????????</h1>
          </div>
          <h1>Hummm this ressource seems to be paid</h1>
          <Link href={'/pricing'}>Go to store</Link>
        </div>
      )}
    </div>
  );
}
