import BallotTrackerInput from "@/components/BallotTrackerInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { MerkleTreeNode } from "@/types/merkle-tree";
import { FormEvent, useEffect, useState } from "react";
import { getProof } from "../__utils";
import { MerkleProof } from "@/types/proofs";
import ProofVerifier from "./ProofVerifier";

type ProofGeneratorProps = {
  merkleTree: MerkleTreeNode;
};

function ProofGenerator({ merkleTree }: ProofGeneratorProps): JSX.Element {
  const [ballotTracker, setBallotTracker] = useState<string>("");
  const { ballotLength } = useGlobalSettings();

  const [proof, setProof] = useState<MerkleProof>();

  const handleGenerateProof = (e: FormEvent) => {
    e.preventDefault();

    if (ballotTracker.length !== ballotLength) return;

    const proof = getProof(ballotTracker, merkleTree);

    setProof(proof);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-80">
      <h1 className="font-bold text-xl">Generate proofs</h1>
      <form onSubmit={handleGenerateProof} className="w-full space-y-2">
        <BallotTrackerInput value={ballotTracker} onChange={setBallotTracker} />
        <Button
          disabled={ballotTracker.length !== ballotLength}
          type="submit"
          className="w-full"
        >
          Generate proof
        </Button>
      </form>
      {proof && (
        <>
          <pre>{JSON.stringify(proof)}</pre>
          <ProofVerifier
            proof={proof}
            root={merkleTree.value}
            target={ballotTracker}
            key={ballotTracker}
          />
        </>
      )}
    </div>
  );
}

export default ProofGenerator;
