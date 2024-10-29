import { MerkleTreeNode } from "@/types/merkle-tree";
import SHA256 from "crypto-js/sha256";

export function createMerkleTree(ballots: string[]) {
  let nodes: MerkleTreeNode[] = ballots.sort().map((ballot) => ({
    id: ballot,
    value: ballot,
    isLeaf: true,
  }));

  let isRoot = false;

  while (!isRoot) {
    const parentNodes: Record<string, MerkleTreeNode[]> = {};

    nodes.forEach((node) => {
      const parentId = node.id.slice(0, -1);

      if (!parentNodes[parentId]) {
        parentNodes[parentId] = [];
      }

      parentNodes[parentId].push(node);
    });

    const newRoundNodes: MerkleTreeNode[] = [];

    for (const [parentId, children] of Object.entries(parentNodes)) {
      if (children.length === 2) {
        const [left, right] = children;

        newRoundNodes.push({
          id: parentId,
          value: SHA256(left.value + right.value).toString(),
          left,
          right,
        });
      } else {
        const isRightMissing = children[0].id.endsWith("0");

        const frontierNode: MerkleTreeNode = {
          id: `${parentId}${isRightMissing ? "1" : "0"}`,
          value: "0",
        };

        const newChildren = isRightMissing
          ? [children[0], frontierNode]
          : [frontierNode, children[0]];

        newRoundNodes.push({
          id: parentId,
          value: SHA256(newChildren[0].value + newChildren[1].value).toString(),
          left: newChildren[0],
          right: newChildren[1],
        });
      }
    }

    nodes = newRoundNodes.sort((a, b) => a.id.localeCompare(b.id));
    isRoot = nodes.length === 1 && nodes[0].id === "";
  }

  return nodes[0];
}
