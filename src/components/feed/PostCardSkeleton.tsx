export default function PostCardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="skeleton w-9 h-9 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <div className="skeleton h-3 w-28 rounded" />
          <div className="skeleton h-2.5 w-16 rounded" />
        </div>
      </div>
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-2/3 rounded" />
      <div className="flex gap-2 pt-1">
        <div className="skeleton h-3 w-12 rounded-full" />
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-3 w-10 rounded-full" />
      </div>
    </div>
  );
}
