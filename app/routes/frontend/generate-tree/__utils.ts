import { MerkleTreeNode } from "@/types/merkle-tree";
import { MerkleProof, ProofStep } from "@/types/proofs";
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

export function getProof(ballot: string, tree: MerkleTreeNode): MerkleProof {
  // 1. The path to the ballot in the tree will always start at the root.
  let currentStep = tree;

  let continueSearch = true;
  let step = 0;

  let included = false;

  // 2. The proof will be a list of siblings that are part of the path to the ballot.
  let proofSteps: ProofStep[] = [];

  while (continueSearch) {
    // 3. The next step is the left child if the next digit is 0, otherwise it is the right child.
    const nextStepIsLeft = ballot[step] === "0";

    const nextStep = nextStepIsLeft ? currentStep.left : currentStep.right;

    if (!nextStep) {
      throw new Error(
        "Somehow an undefined step was reached when finding next step"
      );
    }

    // 4. If we go left in the tree, the right sibling is part of the proof.
    const nextProofStep = nextStepIsLeft
      ? currentStep.right?.value
      : currentStep.left?.value;

    if (!nextProofStep) {
      throw new Error("Somehow an undefined proof step was reached");
    }

    proofSteps.push({
      sibling: nextProofStep,
      siblingPosition: nextStepIsLeft ? "right" : "left",
    });

    currentStep = nextStep;
    step++;

    if (nextStep.isLeaf && nextStep.value === ballot) {
      return {
        targetId: ballot,
        included: true,
        siblings: proofSteps.reverse(),
      };
    }

    if (nextStep.value === "0") {
      return {
        included: false,
        targetId: currentStep.id,
        siblings: proofSteps.reverse(),
      };
    }
  }

  throw new Error("Proof could not be found");
}
