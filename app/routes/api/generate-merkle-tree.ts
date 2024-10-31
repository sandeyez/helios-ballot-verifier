import { db } from "@/db.server";
import { MerkleTreeNode } from "@/types/merkle-tree";
import { Prisma } from "@prisma/client";
import cryptoJs from "crypto-js";

const { SHA256 } = cryptoJs;

export async function action() {
  // Delete all the existing tree nodes.
  await db.node.deleteMany({
    where: {
      NOT: {
        isLeaf: true,
      },
    },
  });

  const ballots = await db.node.findMany({
    orderBy: {
      id: "asc",
    },
  });

  if (ballots.length === 0) {
    return null;
  }

  let nodes: MerkleTreeNode[] = ballots.map(({ id, value }) => ({
    id,
    value,
  }));

  let isRoot = false;
  let layer = 0;

  while (!isRoot) {
    const parentNodes: Record<string, MerkleTreeNode[]> = {};

    nodes.forEach((node) => {
      8;
      const parentId = node.id.slice(0, -1);

      if (!parentNodes[parentId]) {
        parentNodes[parentId] = [];
      }

      parentNodes[parentId].push(node);
    });

    const newRoundNodes: MerkleTreeNode[] = [];
    const createOperations: Prisma.NodeCreateManyInput[] = [];

    for (const [parentId, children] of Object.entries(parentNodes)) {
      if (children.length === 2) {
        const [left, right] = children;

        const parentHash = SHA256(left.value + right.value).toString();

        createOperations.push({
          id: parentId,
          value: parentHash,
          isLeaf: false,
          leftId: left.id,
          rightId: right.id,
        });

        newRoundNodes.push({
          id: parentId,
          value: parentHash,
        });
      } else {
        const isRightMissing = children[0].id.endsWith("0");

        const frontierNode: MerkleTreeNode = {
          id: `${parentId}${isRightMissing ? "1" : "0"}`,
          value: "0",
        };

        const leftValue = isRightMissing
          ? children[0].value
          : frontierNode.value;
        const rightValue = isRightMissing
          ? frontierNode.value
          : children[0].value;

        // Create frontier node.
        createOperations.push({
          id: frontierNode.id,
          value: frontierNode.value,
          isLeaf: false,
        });

        const parentHash = SHA256(leftValue + rightValue).toString();

        // Create parent node.
        createOperations.push({
          id: parentId,
          value: parentHash,
          isLeaf: false,
          leftId: isRightMissing ? children[0].id : frontierNode.id,
          rightId: isRightMissing ? frontierNode.id : children[0].id,
        });

        newRoundNodes.push({
          id: parentId,
          value: parentHash,
        });
      }
    }

    nodes = newRoundNodes.sort((a, b) => a.id.localeCompare(b.id));
    isRoot = nodes.length === 1 && nodes[0].id === "";

    console.log(`Layer ${layer}: ${nodes.length} nodes`);

    layer++;

    await db.node.createMany({
      data: createOperations,
    });
  }

  return new Response("success", {
    status: 200,
  });
}
