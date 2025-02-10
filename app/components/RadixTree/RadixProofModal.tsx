import { cn } from "@/lib/utils";
import {
  CheckIcon,
  CircleChevronLeft,
  CircleChevronRight,
  XIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { RadixProof, Tree } from "@/lib/types";
import { VerifyRadixProofButton } from "./VerifyRadixProofButton";

type ProofModalProps = {
  proof: RadixProof | null;
  rootHash: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ballotId: string;
};

function ProofModal({
  proof,
  open,
  rootHash,
  onOpenChange,
  ballotId,
}: ProofModalProps): JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!proof ? null : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View proof</DialogTitle>
            <DialogDescription>
              Check out the provided proof and validate its authenticity.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 ">
            <Badge
              className={cn(
                "flex items-center gap-1 w-fit py-1 pointer-events-none",
                {
                  "bg-green-500": proof.included,
                  "bg-red-500": !proof.included,
                }
              )}
            >
              {proof.included ? (
                <CheckIcon className="size-4" />
              ) : (
                <XIcon className="size-4" />
              )}
              <span className="text-sm font-medium leading-none ">
                Included
              </span>
              <div className="text-white"></div>
            </Badge>
            <div className="grid grid-cols-[auto_1fr] gap-2 content-center">
              <span className="text-sm font-medium leading-none whitespace-nowrap block w-fit">
                Target ID
              </span>
              <pre className="truncate text-sm">{proof.targetId}</pre>
              <span className="text-sm font-medium leading-none whitespace-nowrap block w-fit">
                Target Value
              </span>
              <pre className="text-sm break-all">{proof.targetValue}</pre>
            </div>
          </div>
          <div>
            <Label>Proof steps</Label>
            <ScrollArea className="h-72 w-full rounded-md border">
              <Accordion type="single" collapsible className="w-full">
                {proof.proofSteps.map(
                  ({ siblingId, siblingPosition, siblingValue, id }, index) => (
                    <>
                      <AccordionItem value={id} className="px-2" key={id}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <span>{index + 1}.</span>
                            <pre className="truncate ">{id}</pre>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="flex wrap gap-y-2 gap-x-4 justify-between">
                          <div>
                            <Label>Sibling ID</Label>
                            <pre>{siblingId}</pre>
                          </div>
                          <div>
                            <Label>Sibling value</Label>
                            <pre>{siblingValue}</pre>
                          </div>
                          <div>
                            <Label>Sibling position</Label>
                            <span className="flex items-center gap-1">
                              {siblingPosition === "left" ? (
                                <CircleChevronLeft className="size-4" />
                              ) : (
                                <CircleChevronRight className="size-4" />
                              )}{" "}
                              {siblingPosition}
                            </span>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </>
                  )
                )}
              </Accordion>
            </ScrollArea>
            <div className="w-full mt-4">
              <VerifyRadixProofButton
                proof={proof}
                rootHash={rootHash}
                ballotId={ballotId}
              />
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default ProofModal;
