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
  // Delete all the existing merkle nodes
  await db.merkleNode.deleteMany();

  // Get all the ballots from the database
  const ballots = await db.ballot.findMany({
    orderBy: {
      id: "asc",
    },
  });

  if (ballots.length === 0) {
    return null;
  }

  // Initialize the nodes with the ballots
  let nodes: TreeNode[] = ballots.map(({ id }) => ({
    id,
    value: id,
    isBallot: true,
  }));

  // Count down the layers and create the parent nodes for each layer
  for (let layer = ballots[0].id.length - 1; layer >= 0; layer--) {
    // Initialize a parentNodes object that maps a parentID to its children that have that parentID as a prefix
    const parentNodes: Record<string, TreeNode[]> = {};

    // Progress update.
    console.log(`Layer ${layer}`);

    // Populate the parentNodes object
    nodes.forEach((node) => {
      const parentId = node.id.slice(0, layer);

      if (!parentNodes[parentId]) {
        parentNodes[parentId] = [];
      }

      parentNodes[parentId].push(node);
    });

    // Reset the nodes array for the next round
    nodes = [];

    // Initialize a list of create operations to batch insert the parent nodes
    const createOperations: Prisma.MerkleNodeCreateManyInput[] = [];

    for (const [parentId, children] of Object.entries(parentNodes)) {
      // If the parent has two children, create a parent node with the hash of the concatenation of the children's hashes
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
        // If the parent has only one child, create a parent node with the hash of the concatenation of the child's hash and a new frontier node
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

    // Sort the nodes by their ID. This ensures that the left child of a parent is always found first.
    nodes = nodes.sort((a, b) => a.id.localeCompare(b.id));

    await db.merkleNode.createMany({
      data: createOperations,
    });
  }

  return new Response("success", {
    status: 200,
  });
}
