import { GenerateTreeForm } from "@/components/GenerateTreeForm";
import { NoTreeFound } from "@/components/NoTreeFound";
import GenerateProofForm from "@/components/ProofForm";
import { db } from "@/db.server";
import { useLoaderData } from "@remix-run/react";

export async function loader() {
  const amountOfDbBallots = await db.ballot.count();
  const root = await db.radixNode.findFirst({
    where: {
      id: "",
    },
  });

  const ballotLength = process.env.BALLOT_LENGTH;

  if (!ballotLength || isNaN(Number(ballotLength))) {
    throw new Error("Ballot length not set");
  }

  return {
    amountOfDbBallots,
    root,
    ballotLength: Number(ballotLength),
  };
}

export default function RadixTreePage() {
  const { amountOfDbBallots, root, ballotLength } =
    useLoaderData<typeof loader>();

  if (amountOfDbBallots === 0) return <NoTreeFound />;

  if (!root) return <GenerateTreeForm treeType="radix" />;

  return (
    <GenerateProofForm
      treeType="radix"
      root={root.value}
      ballotLength={ballotLength}
    />
  );
}
