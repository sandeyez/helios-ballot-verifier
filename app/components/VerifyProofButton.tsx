import { ShieldCheckIcon, ShieldXIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Proof } from "@/lib/types";
import crypto from "crypto-js";

const { SHA256 } = crypto;

type VerifyProofButtonProps = {
  proof: Proof | null;
  rootHash: string;
};

function VerifyProofButton({
  proof,
  rootHash,
}: VerifyProofButtonProps): JSX.Element {
  const [verificationState, setVerificationState] = useState<
    "pending" | "verified" | "failed"
  >("pending");

  function handleVerifyProof() {
    if (!proof) return;

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
        setVerificationState("failed");
        return;
      }
    }

    if (computedRootHash === rootHash) {
      setVerificationState("verified");
    } else {
      setVerificationState("failed");
    }
  }

  switch (verificationState) {
    case "pending": {
      return (
        <Button className="w-full" onClick={handleVerifyProof}>
          Verify Proof
        </Button>
      );
    }
    case "verified": {
      return (
        <Button className="w-full bg-green-500 pointer-events-none">
          <ShieldCheckIcon /> Proof verification successful
        </Button>
      );
    }
    case "failed": {
      return (
        <Button className="w-full bg-red-500 pointer-events-none">
          <ShieldXIcon /> Proof verification failed
        </Button>
      );
    }
  }
}

export default VerifyProofButton;
