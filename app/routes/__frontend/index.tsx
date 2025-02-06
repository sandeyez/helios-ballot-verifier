import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { db } from "@/db.server";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

function TreeLink({ children, to }: { children: string; to: string }) {
  return (
    <Link className="flex items-center hover:underline" to={to}>
      <b>{children}</b>
      <ChevronRight size={16} />
    </Link>
  );
}

export async function loader() {
  const amountOfDbBallots = await db.ballot.count();

  const ballotLength = process.env.BALLOT_LENGTH;
  if (!ballotLength || isNaN(Number(ballotLength))) {
    throw new Error("Ballot length not set");
  }

  return {
    amountOfDbBallots,
    ballotLength: Number(ballotLength),
  };
}

export default function HomePage() {
  const { amountOfDbBallots, ballotLength } = useLoaderData<typeof loader>();
  const [amountOfBallots, setAmountOfBallots] = useState(1);

  const fetcher = useFetcher();

  function handleAddBallots() {
    fetcher.submit(
      {
        amountOfBallots,
      },
      {
        method: "POST",
        action: "/api/ballots",
      }
    );
  }

  function handleDeleteBallots() {
    fetcher.submit(
      {},
      {
        method: "DELETE",
        action: "/api/ballots",
      }
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col gap-2">
        <span className="text-lg font-bold">
          Welcome to the implementation of the Helios ballot verifier protocol.
        </span>
        <span className="text-center">
          This implementation includes the following features:
        </span>
        <div className="grid md:grid-cols-2 md:gap-16 grid-cols-1 gap-4 mt-2">
          <ul className="list-disc">
            <TreeLink to={"/merkle-tree"}>Merkle Tree</TreeLink>
            <li>Construction of a tree</li>
            <li>Generation of (non-)membership proofs</li>
            <li>Verification of proofs</li>
          </ul>
          <ul className="list-disc">
            <TreeLink to={"/radix-tree"}>Radix Tree</TreeLink>
            <li>Construction of a tree</li>
            <li>Generation of (non-)membership proofs</li>
            <li>Verification of proofs</li>
          </ul>
        </div>
        <Separator className="my-4" />
        <div className=" flex flex-col gap-2">
          {amountOfDbBallots > 0 ? (
            <>
              <span className="font-bold text-center">
                {amountOfDbBallots} ballots have been added. Start constructing
                a tree.
              </span>
              <Button
                onClick={handleDeleteBallots}
                variant={"link"}
                className="text-red-500"
                loading={fetcher.state === "submitting"}
              >
                {fetcher.state === "submitting"
                  ? "Deleting ballots... (this may take a while)"
                  : "Delete all ballots"}
              </Button>
            </>
          ) : (
            <>
              <span className="font-bold">Start by adding some ballots</span>
              <Label className="text-gray-500">
                Add any number of random ballots
              </Label>
              <div className="flex gap-2 items-center">
                <Slider
                  min={1}
                  max={Math.min(2 ** ballotLength, 1_000_000)}
                  value={[amountOfBallots]}
                  step={1}
                  onValueChange={([val]) => setAmountOfBallots(val)}
                />
                <span className="whitespace-nowrap">
                  {amountOfBallots} ballot{amountOfBallots === 1 ? "" : "s"}
                </span>
              </div>
              <Button
                loading={fetcher.state === "submitting"}
                onClick={handleAddBallots}
              >
                {fetcher.state === "submitting"
                  ? "Adding ballots... (this may take a while)"
                  : "Add ballots"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
