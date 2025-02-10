import { MerkleProof, ProofVerificactionState } from "@/lib/types";
import crypto from "crypto-js";
import { VerifyProofButton } from "../VerifyProofButton";

const { SHA256 } = crypto;

type VerifyMerkleProofButtonProps = {
  ballotId: string;
  proof: MerkleProof | null;
  rootHash: string;
};

function VerifyMerkleProofButton({
  proof,
  rootHash,
  ballotId,
}: VerifyMerkleProofButtonProps): JSX.Element {
  function handleVerifyMerkleProof(): ProofVerificactionState {
    if (!proof) return "pending";

    if (proof.targetId !== ballotId) return "failed";

    const startingId = proof.included ? proof.targetId : "0";

    const computedRootHash = proof.proofSteps.reduce((acc, step) => {
      const leftValue =
        step.siblingPosition === "left" ? step.siblingValue : acc;
      const rightValue =
        step.siblingPosition === "right" ? step.siblingValue : acc;

      return SHA256(leftValue + rightValue).toString();
    }, startingId);

    if (!proof.included) {
      const path = proof.proofSteps
        .map((step) => (step.siblingPosition === "left" ? "1" : "0"))
        .reverse()
        .join("");

      if (path !== proof.targetId) {
        return "failed";
      }
    }

    if (computedRootHash === rootHash) {
      return "verified";
    } else {
      return "failed";
    }
  }

  return <VerifyProofButton handleVerifyProof={handleVerifyMerkleProof} />;
}

export { VerifyMerkleProofButton };
