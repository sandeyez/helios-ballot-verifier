import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFetcher } from "@remix-run/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

type AddRandomBallotsProps = {
  increment: number;
};

function AddRandomBallots({ increment }: AddRandomBallotsProps): JSX.Element {
  const [amountOfBallots, setAmountOfBallots] = useState(increment);

  const fetcher = useFetcher();

  const handleChangeAmountOfBallots = (
    e: React.MouseEvent<HTMLDivElement>,
    action: "add" | "subtract"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setAmountOfBallots((prev) =>
      Math.max(
        increment,
        action === "add" ? prev + increment : prev - increment
      )
    );
  };

  const handleAddBallots = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    console.log(amountOfBallots);

    fetcher.submit(
      {
        amountOfBallots,
      },
      {
        method: "POST",
        action: "/api/add-random-ballots",
      }
    );
  };

  return (
    <Button
      onClick={handleAddBallots}
      variant="secondary"
      loading={fetcher.state !== "idle"}
    >
      Add <span className="w-8">{amountOfBallots}</span>
      <div className="flex flex-col">
        <div
          className="cursor-pointer"
          onClick={(e) => handleChangeAmountOfBallots(e, "add")}
        >
          <ChevronUp />
        </div>
        <div
          className={cn("cursor-pointer", {
            "opacity-50 pointer-events-none": amountOfBallots === increment,
          })}
          onClick={(e) => handleChangeAmountOfBallots(e, "subtract")}
        >
          <ChevronDown />
        </div>
      </div>
      random ballot{amountOfBallots > 1 ? "s" : ""}
    </Button>
  );
}

export default AddRandomBallots;
