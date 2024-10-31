import { Button } from "@/components/ui/button";
import { useFetcher } from "@remix-run/react";

type DeleteBallotsProps = {};

function DeleteBallots({}: DeleteBallotsProps): JSX.Element {
  const fetcher = useFetcher();

  const handleClick = () => {
    fetcher.submit(
      {},
      {
        method: "POST",
        action: "/api/delete-all-ballots",
      }
    );
  };

  return (
    <Button
      variant="destructive"
      onClick={handleClick}
      loading={fetcher.state !== "idle"}
    >
      Delete
    </Button>
  );
}

export default DeleteBallots;
