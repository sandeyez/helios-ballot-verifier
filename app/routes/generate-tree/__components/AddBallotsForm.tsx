import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MerkleTreeNode } from "@/types/merkle-tree";
import { Plus, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createMerkleTree } from "../__utils";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";

type AddBallotsFormProps = {
  onGenerateMerkleTree: (tree: MerkleTreeNode) => void;
  onReset: () => void;
};

function AddBallotsForm({
  onGenerateMerkleTree,
  onReset,
}: AddBallotsFormProps): JSX.Element {
  const [ballots, setBallots] = useState<string[]>([]);
  const { ballotLength, setBallotLength } = useGlobalSettings();
  const [ballotValue, setBallotValue] = useState<string>("");

  const handleReset = () => {
    setBallots([]);
    setBallotLength(2);
    setBallotValue("");

    onReset();
  };

  const handleChangeBallotLength = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);

    if (isNaN(value) || value < 1) return;

    setBallotLength(value);
    setBallots([]);
    onReset();
  };

  const handleChangeBallotValue = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > ballotLength) return;

    setBallotValue(e.target.value);
  };

  const handleAddBallot = (e: FormEvent) => {
    e.preventDefault();

    if (!ballotValue || ballotValue === "") return;

    if (!ballots.includes(ballotValue))
      setBallots(() => [...ballots, ballotValue]);

    setBallotValue("");
  };

  const handleDeleteBallot = (ballot: string) => {
    setBallots(ballots.filter((b) => b !== ballot));

    onReset();
  };

  const handleGenerateTree = () => {
    const tree = createMerkleTree(ballots);

    console.log(tree);

    onGenerateMerkleTree(tree);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-80">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl">Enter ballots</h1>
        <Button variant="destructive" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <span>Ballot length</span>
        <Input
          type="number"
          className="w-16"
          value={ballotLength}
          onChange={handleChangeBallotLength}
        />
      </div>
      <div>
        {ballots.map((ballot) => (
          <li key={ballot} className="flex w-full">
            <span className="block flex-grow">{ballot}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteBallot(ballot)}
            >
              <X />
            </Button>
          </li>
        ))}
      </div>
      <form className="flex gap-2 items-center" onSubmit={handleAddBallot}>
        <Input
          value={ballotValue}
          onChange={handleChangeBallotValue}
          placeholder="Enter ballot tracker..."
        />
        <Button type="submit" disabled={ballotValue.length !== ballotLength}>
          <Plus />
        </Button>
      </form>
      <Button disabled={ballots.length === 0} onClick={handleGenerateTree}>
        Generate tree
      </Button>
    </div>
  );
}

export default AddBallotsForm;
