import { db } from "@/db.server";
import { TreeNode } from "@/lib/types";
import { Prisma } from "@prisma/client";
import cryptoJs from "crypto-js";

const { SHA256 } = cryptoJs;

function constructParentNode([left, right]: [TreeNode, TreeNode]): [
  string,
  Prisma.MerkleNodeCreateManyInput
] {
  const parentHash = SHA256(left.value + right.value).toString();

  return [
    parentHash,
    {
      id: left.id.slice(0, left.id.length - 1),
      value: parentHash,
      leftId: left.isBallot ? undefined : left.id,
      leftBallotId: left.isBallot ? left.id : undefined,
      rightId: right.isBallot ? undefined : right.id,
      rightBallotId: right.isBallot ? right.id : undefined,
    },
  ];
}

export async function action() {
  const ballots = await db.ballot.findMany({
    orderBy: {
      id: "asc",
    },
  });

  if (ballots.length === 0) {
    return null;
  }

  let nodes: TreeNode[] = ballots.map(({ id }) => ({
    id,
    value: id,
    isBallot: true,
  }));

  for (let layer = ballots[0].id.length - 1; layer >= 0; layer--) {
    const parentNodes: Record<string, TreeNode[]> = {};

    console.log(`Layer ${layer}`);

    nodes.forEach((node) => {
      const parentId = node.id.slice(0, layer);

      if (!parentNodes[parentId]) {
        parentNodes[parentId] = [];
      }

      parentNodes[parentId].push(node);
    });

    nodes = [];
    const createOperations: Prisma.MerkleNodeCreateManyInput[] = [];

    for (const [parentId, children] of Object.entries(parentNodes)) {
      if (children.length === 2) {
        const [left, right] = children;

        const [parentHash, createOperation] = constructParentNode([
          left,
          right,
        ]);

        createOperations.push(createOperation);

        nodes.push({
          id: parentId,
          value: parentHash,
        });
      } else {
        const isRightMissing = children[0].id.endsWith("0");

        const frontierNode: TreeNode = {
          id: parentId + (isRightMissing ? "1" : "0"),
          value: "0",
        };

        createOperations.push({
          id: frontierNode.id,
          value: frontierNode.value,
        });

        const newChildren: [TreeNode, TreeNode] = isRightMissing
          ? [children[0], frontierNode]
          : [frontierNode, children[0]];

        const [parentHash, createOperation] = constructParentNode(newChildren);

        createOperations.push(createOperation);

        nodes.push({
          id: parentId,
          value: parentHash,
        });
      }
    }

    nodes = nodes.sort((a, b) => a.id.localeCompare(b.id));

    await db.merkleNode.createMany({
      data: createOperations,
    });
  }

  return new Response("success", {
    status: 200,
  });
}
