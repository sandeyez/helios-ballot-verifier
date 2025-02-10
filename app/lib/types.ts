export type Tree = "merkle" | "radix";

export type TreeNode = {
  id: string;
  value: string;
  isBallot?: boolean;
  left?: TreeNode | null | undefined;
  right?: TreeNode | null | undefined;
};

export type MerkleProofStep = {
  siblingPosition: "left" | "right";
  siblingId: string;
  siblingValue: string;
};

export type MerkleProof = {
  included: boolean;
  proofSteps: MerkleProofStep[];
  targetId: string;
};

export type RadixProofStep = {
  id: string;
  siblingPosition: "left" | "right";
  siblingId: string;
  siblingValue: string;
};

export type RadixProof = {
  included: boolean;
  proofSteps: RadixProofStep[];
  targetId: string;
  targetValue: string;
};

export type ProofVerificactionState = "pending" | "verified" | "failed";
