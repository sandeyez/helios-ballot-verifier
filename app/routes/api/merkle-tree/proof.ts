import { db } from "@/db.server";
import { MerkleProof, MerkleProofStep } from "@/lib/types";
import { ActionFunctionArgs, json } from "@remix-run/node";

type ActionData = {
  proof: MerkleProof;
};

export type GenerateProofActionData = ActionData;

export async function action({ request }: ActionFunctionArgs) {
  // Get the ballot ID from the form data
  const formData = await request.formData();
  const ballotId = formData.get("ballotId")?.toString();

  if (!ballotId || typeof ballotId !== "string") {
    return new Response("Invalid ballot tracker", {
      status: 400,
    });
  }

  // Get the ballot from the database, if it exists
  const ballot = await db.ballot.findUnique({
    where: {
      id: ballotId,
    },
  });

  // Check if the ballot is included in the tree
  const included = !!ballot;

  // Initially, the target ID is the ballot ID
  let targetId: string = ballotId;

  // Generate all the prefixes of the target ID, this is used to query the database
  const prefixes = Array.from({ length: targetId.length }, (_, i) =>
    targetId.slice(0, targetId.length - i - 1)
  );

  // Find all the nodes that share a prefix with the target ID
  const nodesWithPrefix = await db.merkleNode
    .findMany({
      where: {
        AND: [
          {
            id: {
              in: prefixes,
            },
          },
        ],
      },
      include: {
        left: true,
        right: true,
        leftBallot: true,
        rightBallot: true,
      },
    })
    .then((nodes) => nodes.sort((a, b) => b.id.length - a.id.length));

  // If the ballot is not present in the tree, the target ID is the parent node that shares is the longest prefix of the ballot ID
  if (!included) {
    targetId = nodesWithPrefix[0].id;
  }

  // Initialize the proof steps, and set the prevID to the target ID
  const proofSteps: MerkleProofStep[] = [];
  let prevId = targetId;

  for (const node of nodesWithPrefix) {
    if (!included && node.id === targetId) continue;

    // Get the left and right children of the node
    const left = node.left ?? node.leftBallot;
    const right = node.right ?? node.rightBallot;

    // Determine if the sibling is on the right or left
    const siblingIsRight = left?.id === prevId;
    const sibling = siblingIsRight ? right : left;

    if (!sibling) {
      throw new Error("Invalid tree structure");
    }

    // Add the proof step to the proof steps array
    proofSteps.push({
      siblingValue:
        "value" in sibling && typeof sibling.value === "string"
          ? sibling.value
          : sibling.id,
      siblingId: sibling.id,
      siblingPosition: siblingIsRight ? "right" : "left",
    });

    // Update the prevID to the current node ID
    prevId = node.id;
  }

  return json<ActionData>({
    proof: {
      included,
      targetId,
      proofSteps,
    },
  });
}
