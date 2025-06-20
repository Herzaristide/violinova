import React from 'react';
import CoursesList from '@/components/ui/courses/CoursesList';
import {
  getCourses,
  getSession,
  getSubscription,
  getUserDetails
} from '@/app/supabase-server';

export default async function CoursesPage({
  params: { locale, courseId }
}: {
  params: any;
}) {
  const [session, userDetails, subscription, courses] = await Promise.all([
    getSession(),
    getUserDetails(),
    getSubscription(),
    getCourses()
  ]);

  return (
    <div className="flex md:hidden w-full">
      {/* <CoursesList
        courses={courses}
        subscription={subscription?.prices?.products?.name}
      /> */}
    </div>
  );
}
