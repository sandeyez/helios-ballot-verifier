export type MerkleTreeNode = {
  id: string;
  value: string;
  isLeaf?: boolean;
  left?: MerkleTreeNode;
  right?: MerkleTreeNode;
};
