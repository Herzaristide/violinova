import {
  getCourses,
  getSession,
  getSubscription,
  getUserDetails
} from '@/app/supabase-server';
import CoursesList from '@/components/ui/courses/CoursesList';

export default async function CourseLayout({
  children,
  params: { locale }
}: any) {
  // const t = useTranslations('Courses');
  const [session, userDetails, subscription, courses] = await Promise.all([
    getSession(),
    getUserDetails(),
    getSubscription(),
    getCourses()
  ]);

  return (
    <div className="flex flex-col md:flex-row w-full h-full">
      {/* <CoursesList
        courses={courses}
        subscription={subscription?.prices?.products?.name}
      /> */}
      {children}
    </div>
  );
}
