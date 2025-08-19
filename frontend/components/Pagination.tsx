import { useICD11Context } from '@/context';

export function Pagination() {
  const { search, searchParams, results, isLoading } = useICD11Context();

  if (!results || !results.meta || results.data.length === 0) {
    return null;
  }

  const { page, limit, total, totalPages } = results.meta;

  const handlePrev = () => {
    search({ page: Math.max(1, page - 1) });
  };

  const handleNext = () => {
    search({ page: page + 1 });
  };

  return (
    <div className="mt-6 flex justify-between items-center">
      <button
        onClick={handlePrev}
        disabled={page <= 1 || isLoading}
        className="btn-secondary disabled:opacity-50"
        aria-label="Previous page"
      >
        Previous
      </button>
      <div className="text-sm text-center text-gray-600">
        Page {page} of {totalPages}
      </div>
      <button
        onClick={handleNext}
        disabled={page >= totalPages || isLoading}
        className="btn-secondary disabled:opacity-50"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
}
