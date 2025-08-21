import { useICD11Context } from '@/context';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <Button
        variant="outline"
        onClick={handlePrev}
        disabled={page <= 1 || isLoading}
        aria-label="Previous page"
        className="w-full sm:w-auto"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      <div className="text-sm text-center text-muted-foreground font-medium">
        Page {page} of {totalPages}
      </div>
      <Button
        variant="outline"
        onClick={handleNext}
        disabled={page >= totalPages || isLoading}
        aria-label="Next page"
        className="w-full sm:w-auto"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
