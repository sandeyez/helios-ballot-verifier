import { ProofVerificactionState, RadixProof } from "@/lib/types";
import crypto from "crypto-js";
import { VerifyProofButton } from "../VerifyProofButton";
import { getCommonPrefix } from "@/lib/utils";

const { SHA256 } = crypto;

type VerifyRadixProofButtonProps = {
  ballotId: string;
  proof: RadixProof | null;
  rootHash: string;
};

/**
 * Button component that, when pressed, verifies the given Radix proof against a given root hash and ballot ID.
 *
 * @param ballotId The ID of the ballot to verify the proof against.
 * @param proof The Radix proof to verify.
 * @param rootHash The root hash to verify the proof against.
 */
function VerifyRadixProofButton({
  proof,
  rootHash,
  ballotId,
}: VerifyRadixProofButtonProps): JSX.Element {
  function handleVerifyRadixProof(): ProofVerificactionState {
    if (!proof) return "pending";

    // If the proof does not target the ballot ID, in case of a membership proof, the proof is invalid.
    if (proof.included && proof.targetId !== ballotId) return "failed";

    // Recompute the root hash using the proof steps.
    const computedRootHash = proof.proofSteps.reduce((acc, step) => {
      const leftValue =
        step.siblingPosition === "left" ? step.siblingValue : acc;
      const rightValue =
        step.siblingPosition === "right" ? step.siblingValue : acc;

      const hash = SHA256(
        `${leftValue}${rightValue}${
          step.siblingPosition === "left"
            ? `${step.siblingId}${step.id}`
            : `${step.id}${step.siblingId}`
        }`
      ).toString();

      return hash;
    }, proof.targetValue);

    // If the computed root hash does not match the given root hash, the proof is invalid.
    // Additional checks may be required to ensure the proof is valid.
    if (computedRootHash !== rootHash) {
      console.error("Root hashes do not match");
      return "failed";
    }

    // If the proof is a membership proof, we are done here.
    if (proof.included) return "verified";

    // If the proof is a non-membership proof, additional checks are required to ensure that the correct
    // target node is selected given the ballot ID.

    // If the last parent node does not exist, it means the root was used.
    const lastParentId = proof.proofSteps[1]?.id ?? "";
    const blockingNodeId = proof.proofSteps[0]?.id;
    const blockingNodeSiblingId = proof.proofSteps[0]?.siblingId;

    // If the proof does not contain the necessary information, the proof is invalid.
    if (!blockingNodeId || !blockingNodeSiblingId) return "failed";

    // If the parent and the blocking node do not share a common prefix, the proof is invalid (unless the last parent is the root).
    const sharedPrefixWithParent = getCommonPrefix(ballotId, lastParentId);

    if (lastParentId !== "" && sharedPrefixWithParent.length === 0) {
      console.error("The parent and the ballot do not share a common prefix");
      return "failed";
    }

    // The blocking node must be at least 1 bit closer to the ballot ID than its parent.
    const sharedPrefixWithBlockingNode = getCommonPrefix(
      ballotId,
      blockingNodeId
    );

    // If the blocking node does not further extend the prefix it has of the ballot ID, or if the blocking node ID is direct prefix
    // of the ballot ID, the proof is invalid.
    if (
      sharedPrefixWithBlockingNode.length <= sharedPrefixWithParent.length ||
      sharedPrefixWithBlockingNode === blockingNodeId
    ) {
      console.error(
        "The blocking node is not at least 1 bit closer to the ballot ID than its parent, or the blocking node is a full prefix of the ballot ID"
      );
      return "failed";
    }

    const sharedPrefixWithBlockingNodePrefix = getCommonPrefix(
      ballotId,
      blockingNodeSiblingId
    );

    // If the sibling of the blocking node shares a different prefix with the ballot ID than the parent, the proof is invalid.
    if (sharedPrefixWithBlockingNodePrefix !== sharedPrefixWithParent) {
      console.error(
        "The sibling of the blocking node shares a different prefix with the ballot ID than the parent"
      );
      return "failed";
    }

    return "verified";
  }

  return <VerifyProofButton handleVerifyProof={handleVerifyRadixProof} />;
}

export { VerifyRadixProofButton };
