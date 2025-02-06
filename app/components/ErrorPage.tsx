import { HomeIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "@remix-run/react";

export function ErrorPage({ error }: { error: Error }) {
  console.error(error);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <h1 className="text-lg font-bold">Oh no, an error occurred!</h1>
      <pre>{error?.message}</pre>
      <Link to="/">
        <Button>
          <HomeIcon size={16} />
          Go back to home
        </Button>
      </Link>
    </div>
  );
}
