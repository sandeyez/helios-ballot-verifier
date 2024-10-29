import { useState } from "react";
import AddBallotsForm from "./__components/AddBallotsForm";
import { MerkleTreeNode } from "@/types/merkle-tree";
import VisualizeTree from "./__components/VisualizeTree";

export default function GenerateTree() {
  const [merkleTree, setMerkleTree] = useState<MerkleTreeNode | null>(null);

  return (
    <div className="flex flex-col">
      <AddBallotsForm
        onGenerateMerkleTree={setMerkleTree}
        onReset={() => setMerkleTree(null)}
      />
      {merkleTree && <VisualizeTree merkleTree={merkleTree} />}
    </div>
  );
}
