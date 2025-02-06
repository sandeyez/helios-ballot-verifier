import { db } from "@/db.server";
import { Proof, ProofStep } from "@/lib/types";
import { ActionFunctionArgs, json } from "@remix-run/node";

type ActionData = {
  proof: Proof;
};

export type GenerateProofActionData = ActionData;

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const ballotId = formData.get("ballotId")?.toString();

  if (!ballotId) {
    return new Response("Invalid ballot tracker", {
      status: 400,
    });
  }

  const ballot = await db.ballot.findUnique({
    where: {
      id: ballotId,
    },
  });

  let included = !!ballot;

  let targetId: string = ballotId;

  const prefixes = Array.from({ length: targetId.length }, (_, i) =>
    targetId.slice(0, targetId.length - i - 1)
  );

  if (!included) {
    const nodesWithPrefix = await db.merkleNode
      .findMany({
        where: {
          OR: [
            {
              id: {
                in: prefixes,
              },
            },
            {
              id: targetId,
              value: "0",
            },
          ],
        },
      })
      .then((nodes) => nodes.sort((a, b) => b.id.length - a.id.length));

    targetId = nodesWithPrefix[0].id;
  }

  const parentNodes = await db.merkleNode
    .findMany({
      where: {
        AND: [
          {
            id: {
              in: prefixes,
            },
          },
          {
            id: {
              not: targetId,
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

  let proofSteps: ProofStep[] = [];
  let prevId = targetId;

  for (const node of parentNodes) {
    const left = node.left ?? node.leftBallot;
    const right = node.right ?? node.rightBallot;

    const siblingIsRight = left?.id === prevId;
    const sibling = siblingIsRight ? right : left;

    if (!sibling) {
      throw new Error("Invalid tree structure");
    }

    proofSteps.push({
      siblingValue:
        "value" in sibling && typeof sibling.value === "string"
          ? sibling.value
          : sibling.id,
      siblingId: sibling.id,
      siblingPosition: siblingIsRight ? "right" : "left",
    });

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
