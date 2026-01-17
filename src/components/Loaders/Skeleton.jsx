// Base Skeleton component with shimmer animation
const Skeleton = ({ className = '', variant = 'default' }) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-dark-secondary via-dark-card to-dark-secondary bg-[length:200%_100%] animate-shimmer';

  const variants = {
    default: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
    button: 'rounded-xl h-12',
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  );
};

// Dashboard Hero Skeleton
export const DashboardHeroSkeleton = () => (
  <div className="relative overflow-hidden rounded-2xl bg-dark-card border border-dark-secondary">
    <div className="absolute top-0 right-0 w-96 h-96 bg-dark-secondary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
    <div className="relative p-8 md:p-12">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-10 h-10" />
          <Skeleton className="w-48 h-5" variant="text" />
        </div>
        <Skeleton className="w-full max-w-md h-12 mb-2" />
        <Skeleton className="w-3/4 max-w-sm h-12 mb-4" />
        <Skeleton className="w-full max-w-xl h-5 mb-2" variant="text" />
        <Skeleton className="w-2/3 max-w-md h-5 mb-6" variant="text" />
        <div className="flex flex-wrap gap-3">
          <Skeleton className="w-36 h-12" variant="button" />
          <Skeleton className="w-40 h-12" variant="button" />
        </div>
      </div>
    </div>
  </div>
);

// Feature Card Skeleton
export const FeatureCardSkeleton = () => (
  <div className="bg-dark-card rounded-xl border border-dark-secondary p-6">
    <Skeleton className="w-12 h-12 mb-4" />
    <Skeleton className="w-32 h-6 mb-2" variant="text" />
    <Skeleton className="w-full h-4" variant="text" />
    <Skeleton className="w-3/4 h-4 mt-1" variant="text" />
  </div>
);

// Course Card Skeleton
export const CourseCardSkeleton = () => (
  <div className="relative bg-dark-bg rounded-xl p-5 border border-dark-secondary">
    <Skeleton className="absolute -top-2 -left-2 w-8 h-8" variant="circle" />
    <div className="flex flex-col items-center text-center pt-2">
      <Skeleton className="w-16 h-16 rounded-xl mb-3" />
      <Skeleton className="w-24 h-5 mb-1" variant="text" />
      <Skeleton className="w-16 h-3" variant="text" />
    </div>
  </div>
);

// Dashboard Full Skeleton
export const DashboardSkeleton = () => (
  <div className="space-y-8">
    <DashboardHeroSkeleton />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FeatureCardSkeleton />
      <FeatureCardSkeleton />
      <FeatureCardSkeleton />
    </div>

    <div className="bg-dark-card rounded-xl border border-dark-secondary p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="w-32 h-6 mb-2" variant="text" />
          <Skeleton className="w-56 h-4" variant="text" />
        </div>
        <Skeleton className="w-20 h-4" variant="text" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

// Course Content Page Skeleton
export const CourseContentSkeleton = () => (
  <div className="space-y-6 md:space-y-8">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <Skeleton className="w-48 h-8 mb-2" />
        <Skeleton className="w-72 h-5" variant="text" />
      </div>
      <Skeleton className="w-32 h-8 rounded-full" />
    </div>

    <Skeleton className="max-w-md h-12 rounded-xl" />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-dark-card rounded-xl border border-dark-secondary overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="w-24 h-5 mb-1" variant="text" />
                <Skeleton className="w-16 h-3" variant="text" />
              </div>
            </div>
            <Skeleton className="w-full h-4 mb-1" variant="text" />
            <Skeleton className="w-3/4 h-4" variant="text" />
          </div>
          <div className="px-6 py-4 bg-dark-secondary/30 border-t border-dark-secondary">
            <Skeleton className="w-full h-2 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Topic Sidebar Skeleton
export const TopicSidebarSkeleton = () => (
  <div className="w-72 h-full bg-dark-sidebar border-r border-dark-secondary p-4">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-secondary">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="flex-1 h-6" variant="text" />
    </div>
    <div className="space-y-2">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-dark-card/50">
          <Skeleton className="w-6 h-6" variant="circle" />
          <Skeleton className="flex-1 h-4" variant="text" />
        </div>
      ))}
    </div>
  </div>
);

// Video Player Skeleton
export const VideoPlayerSkeleton = () => (
  <div className="h-[calc(100vh-5rem)] bg-dark-card rounded-lg overflow-hidden">
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-secondary to-dark-card">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-dark-accent/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-dark-accent border-b-[15px] border-b-transparent ml-2" />
          </div>
          <Skeleton className="w-48 h-5 mx-auto mb-2" variant="text" />
          <Skeleton className="w-32 h-4 mx-auto" variant="text" />
        </div>
      </div>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-dark-bg/80 to-transparent">
        <Skeleton className="w-full h-1 rounded-full mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8" variant="circle" />
            <Skeleton className="w-8 h-8" variant="circle" />
            <Skeleton className="w-20 h-4" variant="text" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8" variant="circle" />
            <Skeleton className="w-8 h-8" variant="circle" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// PDF Viewer Skeleton
export const PDFViewerSkeleton = () => (
  <div className="h-[calc(100vh-5rem)] flex flex-col">
    <div className="flex items-center justify-between px-4 py-2 bg-dark-card border-b border-dark-secondary rounded-t-lg">
      <div className="flex items-center gap-3">
        <Skeleton className="w-5 h-5" variant="circle" />
        <Skeleton className="w-40 h-5" variant="text" />
        <Skeleton className="w-12 h-5 rounded" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="w-20 h-8 rounded-lg" />
        <Skeleton className="w-24 h-8 rounded-lg" />
        <Skeleton className="w-24 h-8 rounded-lg" />
      </div>
    </div>
    <div className="flex-1 bg-dark-card flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-32 bg-dark-secondary rounded-lg mx-auto mb-4 flex items-center justify-center">
          <div className="space-y-1">
            <Skeleton className="w-16 h-2" variant="text" />
            <Skeleton className="w-14 h-2" variant="text" />
            <Skeleton className="w-16 h-2" variant="text" />
            <Skeleton className="w-12 h-2" variant="text" />
          </div>
        </div>
        <Skeleton className="w-32 h-4 mx-auto" variant="text" />
      </div>
    </div>
  </div>
);

// Practice Questions Skeleton
export const PracticeSkeleton = () => (
  <div className="h-[calc(100vh-5rem)] overflow-y-auto">
    <div className="space-y-4 p-4 bg-dark-card rounded-lg">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 bg-dark-bg rounded-lg">
          <div className="flex items-start gap-2 mb-4">
            <Skeleton className="w-8 h-5" variant="text" />
            <Skeleton className="flex-1 h-5" variant="text" />
          </div>
          <div className="space-y-2">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="flex items-center gap-3 p-3 rounded-lg bg-dark-secondary/30">
                <Skeleton className="w-4 h-4" variant="circle" />
                <Skeleton className="flex-1 h-4" variant="text" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Coding Playground Skeleton
export const CodingPlaygroundSkeleton = () => (
  <div className="h-[calc(100vh-5rem)] flex flex-col bg-dark-card rounded-lg overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3 bg-dark-secondary border-b border-dark-secondary">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8" variant="circle" />
        <Skeleton className="w-40 h-5" variant="text" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="w-24 h-8 rounded-lg" />
        <Skeleton className="w-20 h-8 rounded-lg" />
      </div>
    </div>
    <div className="flex-1 flex">
      <div className="flex-1 p-4 border-r border-dark-secondary">
        <div className="space-y-2">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-6 h-4" variant="text" />
              <Skeleton className={`h-4 ${i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-1/2' : 'w-2/3'}`} variant="text" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-4 bg-dark-bg">
        <Skeleton className="w-20 h-4 mb-4" variant="text" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i % 2 === 0 ? 'w-full' : 'w-3/4'}`} variant="text" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Course Topics Page Full Skeleton
export const CourseTopicsSkeleton = () => (
  <div className="-m-4 md:-m-6">
    <div className="flex min-h-[calc(100vh-4rem)]">
      <TopicSidebarSkeleton />
      <div className="flex-1 p-2 md:p-4">
        <VideoPlayerSkeleton />
      </div>
    </div>
  </div>
);

export default Skeleton;
