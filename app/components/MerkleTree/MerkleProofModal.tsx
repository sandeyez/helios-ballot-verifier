import { MerkleProof, Tree } from "@/lib/types";
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
import { VerifyMerkleProofButton } from "./VerifyMerkleProofButton";

type ProofModalProps = {
  proof: MerkleProof | null;
  rootHash: string;
  ballotId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Modal implementation for Merkle proofs. It allows the user to view the contents of the proof,
 * and features the ability to verify the proof against a given root hash.
 *
 * @param proof The Merkle proof to display.
 * @param rootHash The root hash to verify the proof against.
 * @param ballotId The ID of the ballot to verify the proof against.
 * @param open Whether the modal is open or not.
 * @param onOpenChange Callback to change the open state of the modal.
 */
function ProofModal({
  proof,
  rootHash,
  ballotId,
  open,
  onOpenChange,
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium leading-none whitespace-nowrap ">
                Target ID
              </span>
              <pre className="truncate text-sm">{proof.targetId}</pre>
            </div>
          </div>
          <div>
            <Label>Proof steps</Label>
            <ScrollArea className="h-72 w-full rounded-md border">
              <Accordion type="single" collapsible className="w-full">
                {proof.proofSteps.map(
                  ({ siblingId, siblingPosition, siblingValue }, index) => (
                    <>
                      <AccordionItem
                        value={siblingId}
                        className="px-2"
                        key={siblingId}
                      >
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <span>{index + 1}.</span>
                            <pre className="truncate ">
                              {siblingId.slice(0, -1)}
                              {siblingId.at(-1) === "0" ? "1" : "0"}
                            </pre>
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
              <VerifyMerkleProofButton
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
