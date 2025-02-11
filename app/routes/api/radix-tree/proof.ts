import { db } from "@/db.server";
import { RadixProof, RadixProofStep } from "@/lib/types";
import { getCommonPrefix } from "@/lib/utils";
import { ActionFunctionArgs, json } from "@remix-run/node";

type ActionData = {
  proof: RadixProof;
};

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

  // Check if the ballot is included
  const included = !!ballot;

  // Initially, the target ID is the ballot ID and the target value is the ballot ID as well
  let targetId: string = ballotId;
  let targetValue: string = ballotId;

  // Generate all the prefixes of the target ID, this is used to query the database
  const prefixes = Array.from({ length: targetId.length }, (_, i) =>
    targetId.slice(0, targetId.length - i - 1)
  );

  // Find all the nodes that share a prefix with the target ID
  const nodesWithPrefix = await db.radixNode
    .findMany({
      where: {
        id: {
          in: prefixes,
        },
      },
      include: {
        left: true,
        right: true,
        leftBallot: true,
        rightBallot: true,
      },
    })
    .then((nodes) => nodes.sort((a, b) => b.id.length - a.id.length));

  // If the ballot is not included, find the node that blocks its hypothetical path from the root.
  if (!included) {
    // For this, we must first find the nodes that is the longest prefix of the ballot ID
    const longestPrefixNode = nodesWithPrefix[0];

    // Get the left and right children of the longest prefix node
    const left = longestPrefixNode.left ?? longestPrefixNode.leftBallot;
    const right = longestPrefixNode.right ?? longestPrefixNode.rightBallot;

    if (!left || !right) {
      throw new Error("Could not find left or right child");
    }

    // The target node is the child of the longestPrefixNode that shares the longest common prefix with the ballotID
    const leftIsNextChild =
      getCommonPrefix(ballotId, left.id).length >
      getCommonPrefix(ballotId, right.id).length;

    const nextChild = leftIsNextChild ? left : right;

    // Set the target ID and value to the target node information
    targetId = nextChild.id;
    targetValue =
      "value" in nextChild && typeof nextChild.value === "string"
        ? nextChild.value
        : nextChild.id;
  }

  // Initialize the proof steps, and set the prevID to the target ID
  let proofSteps: RadixProofStep[] = [];
  let prevId = targetId;

  for (const node of nodesWithPrefix) {
    // Get the left and right children of the node
    const left = node.left ?? node.leftBallot;
    const right = node.right ?? node.rightBallot;

    // Determine if the sibling is on the right or left
    const siblingIsRight = left?.id === prevId;
    const sibling = siblingIsRight ? right : left;

    if (!sibling) {
      throw new Error("Could not find next sibling in path");
    }

    // Add the proof step to the proof steps array
    proofSteps.push({
      id: (siblingIsRight ? left?.id : right?.id) as string,
      siblingPosition: siblingIsRight ? "right" : "left",
      siblingId: sibling.id,
      siblingValue:
        "value" in sibling && typeof sibling.value === "string"
          ? sibling.value
          : sibling.id,
    });

    // Update the prevID to the current node ID
    prevId = node.id;
  }

  return json<ActionData>({
    proof: {
      included,
      targetValue,
      targetId,
      proofSteps,
    },
  });
}
