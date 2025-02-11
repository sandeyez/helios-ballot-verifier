import { MerkleProof, ProofVerificactionState } from "@/lib/types";
import crypto from "crypto-js";
import { VerifyProofButton } from "../VerifyProofButton";

const { SHA256 } = crypto;

type VerifyMerkleProofButtonProps = {
  ballotId: string;
  proof: MerkleProof | null;
  rootHash: string;
};

/**
 * Button component that, when pressed, verifies the given Merkle proof against a given root hash and ballot ID.
 *
 * @param ballotId The ID of the ballot to verify the proof against.
 * @param proof The Merkle proof to verify.
 * @param rootHash The root hash to verify the proof against.
 */
function VerifyMerkleProofButton({
  proof,
  rootHash,
  ballotId,
}: VerifyMerkleProofButtonProps): JSX.Element {
  function handleVerifyMerkleProof(): ProofVerificactionState {
    if (!proof) return "pending";

    // If the proof does not target the ballot ID, in case of a membership proof, or the target node
    // is not a prefix of the given ballot, in case of a non-membership proof, the proof is invalid.
    if (
      proof.included
        ? proof.targetId !== ballotId
        : !ballotId.startsWith(proof.targetId)
    ) {
      console.error("The proof targets a different node");
      return "failed";
    }

    // If the proof is a membership proof, the starting value is the proof target ID, stored in the leaf.
    // If the proof is a non-membership proof, the starting value is 0, representing a frontier node.
    const startingValue = proof.included ? proof.targetId : "0";

    // Recompute the root hash using the proof steps.
    const computedRootHash = proof.proofSteps.reduce((acc, step) => {
      const leftValue =
        step.siblingPosition === "left" ? step.siblingValue : acc;
      const rightValue =
        step.siblingPosition === "right" ? step.siblingValue : acc;

      return SHA256(leftValue + rightValue).toString();
    }, startingValue);

    // If the proof is a non-membership proof, it must be verified that the path to the target matches
    // the targetID. This ensures that a proof for any arbitrary frontier node is not accepted.
    if (!proof.included) {
      const path = proof.proofSteps
        .map((step) => (step.siblingPosition === "left" ? "1" : "0"))
        .reverse()
        .join("");

      if (path !== proof.targetId) {
        console.error("The path does not match the target ID");
        return "failed";
      }
    }

    // If the computed root hash matches the given root hash, the proof is valid. If not, it is invalid.
    if (computedRootHash === rootHash) {
      return "verified";
    } else {
      console.error("Root hashes do not match");
      return "failed";
    }
  }

  return <VerifyProofButton handleVerifyProof={handleVerifyMerkleProof} />;
}

export { VerifyMerkleProofButton };
