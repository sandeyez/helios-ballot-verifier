import { toast } from "@/hooks/use-toast";
import { MerkleProof, RadixProof, Tree } from "@/lib/types";
import { useFetcher } from "@remix-run/react";
import { CopyIcon, DicesIcon } from "lucide-react";
import { useEffect, useState } from "react";
import MerkleProofModal from "./MerkleTree/MerkleProofModal";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import RadixProofModal from "./RadixTree/RadixProofModal";

type GenerateProofFormProps = {
  root: string;
  ballotLength: number;
  treeType: Tree;
};

function GenerateProofForm({
  root,
  ballotLength,
  treeType,
}: GenerateProofFormProps): JSX.Element {
  const [ballotId, dangerouslySetBallotId] = useState("");
  const [proof, setProof] = useState<MerkleProof | RadixProof | null>(null);
  const [proofModalOpen, setProofModalOpen] = useState(false);

  const getRandomBallotFetcher = useFetcher();

  function setBallotId(newValue: string) {
    dangerouslySetBallotId(newValue);
    setProof(null);
  }

  function handleChangeBallotId(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    const cleanedValue = [...value.matchAll(/[01]/g)]
      .join("")
      .slice(0, ballotLength);

    setBallotId(cleanedValue);
  }

  async function handleRandomizeBallot() {
    await fetch("/api/ballot")
      .then(async (res) => {
        if (!res.ok || res.status !== 200) return;

        const data = await res.json();

        if (
          !data ||
          typeof data !== "object" ||
          !("ballotId" in data) ||
          typeof data.ballotId !== "string"
        )
          return;

        setBallotId(data.ballotId);
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Could not fetch a random ballot.",
        });
      });
  }

  const generateProofFetcher = useFetcher();

  async function handleGetProof() {
    if (!ballotId || ballotId.length !== ballotLength) return;

    const formData = new FormData();
    formData.append("ballotId", ballotId);

    await fetch(`/api/${treeType}-tree/proof`, {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        if (!res.ok || res.status !== 200) throw new Error();

        const data = await res.json();

        if (typeof data !== "object" || !("proof" in data)) throw new Error();

        setProof(data.proof);
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Could not generate  proof.",
        });
      });
  }

  function handleCopyRoot() {
    navigator.clipboard.writeText(root);

    toast({
      title: "Root hash copied",
      description: "The root hash has been copied to your clipboard.",
    });
  }

  return (
    <>
      <Card className="w-fit mx-auto max-w-full">
        <CardHeader>
          <CardTitle>Generate Proof</CardTitle>
          <CardDescription className="truncate">
            Enter any ballot to generate a proof.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label>Root hash</Label>
          <div className="flex items-center gap-2 max-w-lg">
            <Input
              value={root}
              className="max-w-full w-screen cursor-not-allowed"
              readOnly
            />
            <Button onClick={handleCopyRoot}>
              <CopyIcon />
            </Button>
          </div>
          <Separator className="my-2" />
          <Label>Ballot ID</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter ballot ID"
              value={ballotId}
              onChange={handleChangeBallotId}
            />
            <Button onClick={handleRandomizeBallot}>
              <DicesIcon />
            </Button>
          </div>
          {proof === null ? (
            <Button
              className="mt-4"
              disabled={ballotId.length !== ballotLength}
              loading={generateProofFetcher.state === "submitting"}
              onClick={handleGetProof}
            >
              Generate proof
            </Button>
          ) : (
            <Button
              className="mt-4"
              variant="secondary"
              onClick={() => setProofModalOpen(true)}
            >
              View proof ({proof.proofSteps.length} steps)
            </Button>
          )}
        </CardContent>
      </Card>
      {(() => {
        switch (treeType) {
          case "merkle":
            return (
              <MerkleProofModal
                proof={proof as MerkleProof | null}
                open={proofModalOpen && proof !== null}
                onOpenChange={setProofModalOpen}
                rootHash={root}
                ballotId={ballotId}
              />
            );
          case "radix":
            return (
              <RadixProofModal
                proof={proof as RadixProof | null}
                open={proofModalOpen && proof !== null}
                onOpenChange={setProofModalOpen}
                rootHash={root}
                ballotId={ballotId}
              />
            );
        }
      })()}
    </>
  );
}

export default GenerateProofForm;
