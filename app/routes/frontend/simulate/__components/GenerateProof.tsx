import BallotTrackerInput from "@/components/BallotTrackerInput";
import { Button } from "@/components/ui/button";
import { GenerateProofActionData } from "@/routes/api/generate-proof";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import ProofVerifier from "../../generate-tree/__components/ProofVerifier";

type GenerateProofProps = {
  rootHash: string;
};

function GenerateProof({ rootHash }: GenerateProofProps): JSX.Element {
  const [ballotTracker, setBallotTracker] = useState<string>("");

  const fetcher = useFetcher<GenerateProofActionData>();

  const handleGenerateProof = () => {
    fetcher.submit(
      {
        ballotTracker,
      },
      {
        method: "POST",
        action: "/api/generate-proof",
      }
    );
  };

  return (
    <>
      <h1 className="font-bold text-lg">Generate proof</h1>
      <BallotTrackerInput value={ballotTracker} onChange={setBallotTracker} />
      <Button onClick={handleGenerateProof}>Generate proof</Button>
      {fetcher.data?.proof && (
        <>
          <pre>{JSON.stringify(fetcher.data.proof)}</pre>
          <ProofVerifier
            proof={fetcher.data.proof}
            root={rootHash}
            target={ballotTracker}
            key={ballotTracker}
          />
        </>
      )}
    </>
  );
}

export default GenerateProof;
