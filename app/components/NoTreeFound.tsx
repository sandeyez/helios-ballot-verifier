import { Link } from "@remix-run/react";
import { HomeIcon } from "lucide-react";
import { Button } from "./ui/button";

type NoTreeFoundProps = {};

export function NoTreeFound({}: NoTreeFoundProps): JSX.Element {
  return (
    <>
      <span className="font-bold text-lg">No ballots found.</span>
      <span className="text-center">
        You can add random ballots on the homepage.
      </span>
      <Link to="/">
        <Button>
          <HomeIcon /> Return to homepage
        </Button>
      </Link>
    </>
  );
}
