import { useFetcher } from "@remix-run/react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { capitalizeFirstLetter } from "@/lib/utils";
import { Tree } from "@/lib/types";

type GenerateTreeFormProps = {
  treeType: Tree;
};

/**
 * Form that is used to generate a tree.
 *
 * @param treeType The type of tree to generate, used to determine the endpoint to call.
 */
export function GenerateTreeForm({
  treeType,
}: GenerateTreeFormProps): JSX.Element {
  const createTreeFetcher = useFetcher();

  const handleCreateTree = () => {
    createTreeFetcher.submit(
      {},
      {
        method: "POST",
        action: `/api/${treeType}-tree`,
      }
    );
  };

  useEffect(() => {
    if (createTreeFetcher.state === "idle" && !createTreeFetcher.data) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `Could not generate ${capitalizeFirstLetter(
          treeType
        )} tree.`,
      });
    }
  }, [createTreeFetcher.state]);

  return (
    <Card className="w-fit">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">
          No {capitalizeFirstLetter(treeType)} Tree found
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <span>
          You need to generate a {capitalizeFirstLetter(treeType)} Tree to
          verify the ballots.
        </span>
        <Button
          className="w-full"
          onClick={handleCreateTree}
          loading={createTreeFetcher.state === "submitting"}
        >
          {createTreeFetcher.state === "submitting"
            ? "Generating..."
            : `Generate ${capitalizeFirstLetter(treeType)} Tree`}
        </Button>
      </CardContent>
    </Card>
  );
}
