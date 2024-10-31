export type ProofStep = {
  siblingPosition: "left" | "right";
  sibling: string;
};

export type MerkleProof = {
  siblings: ProofStep[];
  included: boolean;
  targetId: string;
};
