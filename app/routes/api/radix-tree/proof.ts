import { db } from "@/db.server";
import { RadixProof, RadixProofStep } from "@/lib/types";
import { getCommonPrefix } from "@/lib/utils";
import { ActionFunctionArgs, json } from "@remix-run/node";

type ActionData = {
  proof: RadixProof;
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const ballotId = formData.get("ballotId")?.toString();

  if (!ballotId || typeof ballotId !== "string") {
    return new Response("Invalid ballot tracker", {
      status: 400,
    });
  }

  const ballot = await db.ballot.findUnique({
    where: {
      id: ballotId,
    },
  });

  const included = !!ballot;

  let targetId: string = ballotId;
  let targetValue: string = ballotId;

  const prefixes = Array.from({ length: targetId.length }, (_, i) =>
    targetId.slice(0, targetId.length - i - 1)
  );

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

  if (!included) {
    const longestPrefixNode = nodesWithPrefix[0];

    const left = longestPrefixNode.left ?? longestPrefixNode.leftBallot;
    const right = longestPrefixNode.right ?? longestPrefixNode.rightBallot;

    if (!left || !right) {
      throw new Error("Could not find left or right child");
    }

    const leftIsNextChild =
      getCommonPrefix(ballotId, left.id).length >
      getCommonPrefix(ballotId, right.id).length;

    const nextChild = leftIsNextChild ? left : right;

    targetId = nextChild.id;
    targetValue =
      "value" in nextChild && typeof nextChild.value === "string"
        ? nextChild.value
        : nextChild.id;
  }

  let proofSteps: RadixProofStep[] = [];
  let prevId = targetId;

  for (const node of nodesWithPrefix) {
    const left = node.left ?? node.leftBallot;
    const right = node.right ?? node.rightBallot;

    const siblingIsRight = left?.id === prevId;
    const sibling = siblingIsRight ? right : left;

    if (!sibling) {
      throw new Error("Could not find next sibling in path");
    }

    proofSteps.push({
      id: (siblingIsRight ? left?.id : right?.id) as string,
      siblingPosition: siblingIsRight ? "right" : "left",
      siblingId: sibling.id,
      siblingValue:
        "value" in sibling && typeof sibling.value === "string"
          ? sibling.value
          : sibling.id,
    });

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
