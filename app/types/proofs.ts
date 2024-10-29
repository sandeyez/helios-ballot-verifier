export type ProofStep = {
  position: "left" | "right";
  sibling: string;
};

export type MerkleProof = {
  siblings: ProofStep[];
} & (
  | {
      included: true;
    }
  | {
      included: false;
      parentId: string;
    }
);
