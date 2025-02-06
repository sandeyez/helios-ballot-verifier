export type Tree = "merkle" | "radix";

export type TreeNode = {
  id: string;
  value: string;
  isBallot?: boolean;
  left?: TreeNode | null | undefined;
  right?: TreeNode | null | undefined;
};

export type ProofStep = {
  siblingPosition: "left" | "right";
  siblingId: string;
  siblingValue: string;
};

export type Proof = {
  proofSteps: ProofStep[];
  included: boolean;
  targetId: string;
};
