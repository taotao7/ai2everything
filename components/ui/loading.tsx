export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex h-[450px] w-full items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="flex flex-col rounded-lg border bg-card animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}
