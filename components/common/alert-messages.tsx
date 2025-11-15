import { Alert, AlertDescription } from "../ui/alert";

export const AlertMessages = ({
  message,
  error,
}: {
  message: string;
  error: string;
}) => (
  <div className="mx-4 mb-3">
    {message && (
      <Alert>
        <AlertDescription className="text-green-600">
          {message}
        </AlertDescription>
      </Alert>
    )}

    {error && (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}
  </div>
);
