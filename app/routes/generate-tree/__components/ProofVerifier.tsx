import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MerkleProof } from "@/types/proofs";
import SHA256 from "crypto-js/sha256";
import { ShieldCheck, ShieldX } from "lucide-react";
import { useEffect, useState } from "react";

type ProofVerifierProps = {
  proof: MerkleProof;
  root: string;
  target: string;
};

function ProofVerifier({
  proof,
  root,
  target,
}: ProofVerifierProps): JSX.Element {
  const [isValid, setIsValid] = useState<boolean>();

  const handleVerifyProof = () => {
    if (!proof || !root || !target) return;

    if (proof.included === false) {
      if (!target.startsWith(proof.parentId)) {
        setIsValid(false);
        return;
      }
    }

    let currentHash = proof.included ? target : "0";

    for (const step of proof.siblings) {
      const left = step.position === "left" ? step.sibling : currentHash;
      const right = step.position === "right" ? step.sibling : currentHash;

      console.log(currentHash);
      currentHash = SHA256(left + right).toString();
    }
    console.log(currentHash);

    setIsValid(currentHash === root);
  };

  return (
    <div>
      <Button
        className={cn("", {
          "pointer-events-none": isValid !== undefined,
          "bg-green-300 text-green-600": isValid === true,
          "bg-red-300 text-red-600": isValid === false,
        })}
        onClick={handleVerifyProof}
      >
        {(() => {
          switch (isValid) {
            case true:
              return (
                <>
                  <ShieldCheck /> Proof is valid
                </>
              );
            case false:
              return (
                <>
                  <ShieldX /> Proof is invalid
                </>
              );
            default:
              return "Verify proof";
          }
        })()}
      </Button>
    </div>
  );
}

export default ProofVerifier;
