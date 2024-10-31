import { Button } from "@/components/ui/button";
import { useFetcher } from "@remix-run/react";

type GenerateTreeButtonProps = {
  disabled: boolean;
};

function GenerateTreeButton({
  disabled,
}: GenerateTreeButtonProps): JSX.Element {
  const fetcher = useFetcher();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    fetcher.submit(
      {},
      {
        method: "POST",
        action: "/api/generate-merkle-tree",
      }
    );
  };

  return (
    <Button
      onClick={handleClick}
      loading={fetcher.state !== "idle"}
      disabled={disabled}
    >
      Generate Merkle tree
    </Button>
  );
}

export default GenerateTreeButton;
