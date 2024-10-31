import { MerkleTreeNode } from "@/types/merkle-tree";
import { useEffect, useState } from "react";
import VisualizeTreeLayer from "./VisualizeTreeLayer";

type VisualizeTreeProps = {
  merkleTree: MerkleTreeNode;
};

function VisualizeTree({ merkleTree }: VisualizeTreeProps): JSX.Element {
  return (
    <div className="flex flex-col">
      <h1 className="font-bold text-xl">Visualize tree</h1>
      <div>
        <VisualizeTreeLayer nodes={[merkleTree]} />
      </div>
    </div>
  );
}

export default VisualizeTree;
