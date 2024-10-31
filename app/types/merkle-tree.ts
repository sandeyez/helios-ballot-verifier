export type MerkleTreeNode = {
  id: string;
  value: string;
  isLeaf?: boolean;
  left?: MerkleTreeNode | null | undefined;
  right?: MerkleTreeNode | null | undefined;
};
