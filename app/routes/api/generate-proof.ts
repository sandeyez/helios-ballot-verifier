import { db } from "@/db.server";
import { MerkleProof, ProofStep } from "@/types/proofs";
import { ActionFunctionArgs, json } from "@remix-run/node";

type ActionData = {
  proof: MerkleProof;
};

export type GenerateProofActionData = ActionData;

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const ballotTracker = formData.get("ballotTracker")?.toString();

  if (!ballotTracker) {
    return new Response("Invalid ballot tracker", {
      status: 400,
    });
  }

  const ballot = await db.node.findUnique({
    where: {
      id: ballotTracker,
    },
  });

  let included = !!ballot;

  let targetId = ballotTracker;

  if (!included) {
    const prefixes = Array.from({ length: targetId.length }, (_, i) =>
      targetId.slice(0, targetId.length - i)
    );

    for (const prefix of prefixes) {
      const result = await db.node.findUnique({
        where: {
          id: prefix,
        },
      });

      // Return as soon as we find the first match (longest prefix match)
      if (result) {
        targetId = result.id;
        break;
      }
    }
  }

  const siblingIdsToInclude = targetId.split("").reduceRight<
    Array<{
      siblingId: string;
      siblingPosition: "left" | "right";
    }>
  >((acc, curr, i) => {
    const siblingId = targetId.slice(0, i) + (curr === "0" ? "1" : "0");

    acc.push({
      siblingId,
      siblingPosition: curr === "0" ? "right" : "left",
    });

    return acc;
  }, []);

  const siblingValues = await db.node
    .findMany({
      where: {
        id: {
          in: siblingIdsToInclude.map(({ siblingId }) => siblingId),
        },
      },
    })
    .then((siblings) =>
      siblings
        .map(({ value, id }) => ({ value, id }))
        .sort((a, b) => b.id.length - a.id.length)
    );

  const proofPath = siblingIdsToInclude.map(
    ({ siblingId, siblingPosition }, index) => {
      const sibling = siblingValues[index];

      if (!sibling || sibling.id !== siblingId) {
        throw new Error("Sibling not found");
      }

      return {
        sibling: sibling.value,
        siblingPosition,
      };
    }
  );

  return json<ActionData>({
    proof: {
      included,
      targetId,
      siblings: proofPath,
    },
  });
}
