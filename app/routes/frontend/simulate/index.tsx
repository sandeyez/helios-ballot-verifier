import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { db } from "@/db.server";
import { Prisma } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import pkg from "crypto-js";
import { Copy } from "lucide-react";
import AddRandomBallots from "./__components/AddRandomBallots";
import DeleteBallots from "./__components/DeleteBallots";
import GenerateProof from "./__components/GenerateProof";
import GenerateTreeButton from "./__components/GenerateTreeButton";
const { SHA256 } = pkg;

type LoaderData = {
  ballots: string[];
  noOfBallots: number;
  addBallotIncrement: number;

  rootHash: string | undefined;
};

export async function loader({}: LoaderFunctionArgs) {
  const where: Prisma.NodeWhereInput = {
    isLeaf: true,
  };

  const ballotsPromise = db.node.findMany({
    where,
    orderBy: {
      id: "asc",
    },
    take: 10,
  });

  const noOfBallotsPromise = db.node.count({
    where,
  });

  const treeRootPromise = db.node.findFirst({
    where: {
      id: "",
    },
  });

  const ballotLength = Number(process.env.BALLOT_LENGTH);
  if (!ballotLength || isNaN(ballotLength)) {
    throw new Error("Ballot length not set");
  }

  const [ballots, noOfBallots, treeRoot] = await Promise.all([
    ballotsPromise,
    noOfBallotsPromise,
    treeRootPromise,
  ]);

  return json<LoaderData>({
    ballots: ballots.map((ballot) => ballot.value),
    noOfBallots,
    addBallotIncrement: 1000,
    rootHash: treeRoot?.value,
  });
}

function Simulate(): JSX.Element {
  const { ballots, noOfBallots, addBallotIncrement, rootHash } =
    useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-2 w-full max-w-2xl">
      <div className="flex items-center gap-4 justify-between">
        <h1 className="font-bold text-xl">Ballots ({noOfBallots})</h1>
        {true && (
          <div className="flex items-center gap-2">
            <AddRandomBallots increment={addBallotIncrement} />
            <DeleteBallots />
          </div>
        )}
      </div>
      <div className="flex flex-col">
        {ballots.slice(0, 10).map((ballot) => (
          <div className="flex items-center gap-2">
            <Button
              size={"icon"}
              onClick={() => navigator.clipboard.writeText(ballot)}
              variant={"link"}
            >
              <Copy />
            </Button>
            <span
              className="text-sm text-ellipsis block w-full overflow-hidden whitespace-nowrap"
              key={ballot}
            >
              {ballot}
            </span>
          </div>
        ))}
      </div>
      <GenerateTreeButton disabled={ballots.length === 0} />
      {rootHash && (
        <>
          <h1 className="font-bold text-xl">Merkle tree</h1>
          <span className="text-sm">Root hash: {rootHash}</span>

          <GenerateProof rootHash={rootHash} />
        </>
      )}
    </div>
  );
}

export default Simulate;
