interface ErrorMessageProps {
  message: string;
  retry?: () => void;
}

export function ErrorMessage({ message, retry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <div className="flex items-center gap-2 text-sm text-destructive">
        <span>{message}</span>
        {retry && (
          <button
            onClick={retry}
            className="hover:text-destructive/80 font-medium"
          >
            重试
          </button>
        )}
      </div>
    </div>
  );
}

export function ErrorPage({ message, retry }: ErrorMessageProps) {
  return (
    <div className="flex h-[450px] w-full flex-col items-center justify-center gap-2">
      <p className="text-lg font-medium text-destructive">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="text-sm text-muted-foreground hover:text-destructive"
        >
          重试
        </button>
      )}
    </div>
  );
}
