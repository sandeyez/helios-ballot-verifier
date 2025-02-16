import { ProofVerificactionState } from "@/lib/types";
import { ShieldCheckIcon, ShieldXIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

type VerifyProofButtonProps = {
  handleVerifyProof: () => ProofVerificactionState;
};

/**
 * Wrapper of the Button-component that changes color based on the verification state.
 *
 * @param handleVerifyProof The function to call when the button is clicked. This function should return
 * the next verification state.
 */
export function VerifyProofButton({
  handleVerifyProof,
}: VerifyProofButtonProps) {
  const [verificationState, setVerificationState] =
    useState<ProofVerificactionState>("pending");

  const onVerifyProof = () => {
    const verificationState = handleVerifyProof();
    setVerificationState(verificationState);
  };

  switch (verificationState) {
    case "pending": {
      return (
        <Button className="w-full" onClick={onVerifyProof}>
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
