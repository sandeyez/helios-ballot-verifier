import { db } from "@/db.server";
import { TreeNode } from "@/lib/types";
import { Prisma } from "@prisma/client";
import cryptoJs from "crypto-js";

const { SHA256 } = cryptoJs;

function constructParentNode(
  [left, right]: [TreeNode, TreeNode],
  layer: number
): [string, Prisma.RadixNodeCreateManyInput] {
  const id = left.id.slice(0, layer);
  const parentHash = SHA256(
    left.value + right.value + left.id + right.id
  ).toString();

  return [
    parentHash,
    {
      id,
      value: parentHash,
      leftId: left.isBallot ? undefined : left.id,
      leftBallotId: left.isBallot ? left.id : undefined,
      rightId: right.isBallot ? undefined : right.id,
      rightBallotId: right.isBallot ? right.id : undefined,
    },
  ];
}

export async function action() {
  // Delete all the existing radix nodes
  await db.radixNode.deleteMany();

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
    const createOperations: Prisma.RadixNodeCreateManyInput[] = [];

    for (const [parentId, children] of Object.entries(parentNodes)) {
      // If the parent has two children, create a parent node with the hash of the concatenation of the children's hashes and IDs
      if (children.length === 2) {
        const [left, right] = children;

        const [parentHash, createOperation] = constructParentNode(
          [left, right],
          layer
        );

        createOperations.push(createOperation);

        nodes.push({
          id: parentId,
          value: parentHash,
        });
      } else {
        // If the parent has only one child, add the child to the nodes array for the next round
        nodes.push(children[0]);
      }
    }

    // Sort the nodes by their ID. This ensures that the left child of a parent is always found first.
    nodes = nodes.sort((a, b) => a.id.localeCompare(b.id));

    await db.radixNode.createMany({
      data: createOperations,
    });
  }

  return new Response("success", {
    status: 200,
  });
}
