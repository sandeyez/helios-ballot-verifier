import { useState } from "react";
import AddBallotsForm from "./__components/AddBallotsForm";
import { MerkleTreeNode } from "@/types/merkle-tree";
import VisualizeTree from "./__components/VisualizeTree";
import ProofGenerator from "./__components/ProofGenerator";

export default function GenerateTree() {
  const [merkleTree, setMerkleTree] = useState<MerkleTreeNode | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <AddBallotsForm
        onGenerateMerkleTree={setMerkleTree}
        onReset={() => setMerkleTree(null)}
      />
      {merkleTree && <VisualizeTree merkleTree={merkleTree} />}
      {merkleTree && <ProofGenerator merkleTree={merkleTree} />}
    </div>
  );
}
