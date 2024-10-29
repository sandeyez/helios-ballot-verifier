import { MerkleTreeNode } from "@/types/merkle-tree";
import { useEffect, useState } from "react";

type VisualizeTreeLayerProps = {
  layer?: number;
  nodes: MerkleTreeNode[];
};

function VisualizeTreeLayer({ layer = 0, nodes }: VisualizeTreeLayerProps) {
  // Generate all possible binary numbers of length layer
  const possibleKeys =
    layer === 0
      ? [""]
      : Array.from({ length: 2 ** layer }, (_, i) =>
          i.toString(2).padStart(layer, "0")
        );

  return (
    <>
      <div
        className="grid justify-items-center"
        style={{
          gridTemplateColumns: `repeat(${2 ** layer}, 1fr)`,
        }}
      >
        {possibleKeys.map((key) => {
          const node = nodes.find((n) => n.id === key);

          return (
            <div className="flex flex-col items-center justify-center w-full border border-black border-solid text-center">
              {node ? (
                <>
                  {node.id || "ROOT"}
                  <br />
                  {node.value.slice(0, 8)}
                </>
              ) : null}
            </div>
          );
        })}
      </div>
      {!nodes[0].isLeaf && (
        <VisualizeTreeLayer
          layer={layer + 1}
          nodes={nodes.flatMap((n) => {
            if (!n.left && !n.right) return [];

            if (!n.left) return [n.right] as MerkleTreeNode[];

            if (!n.right) return [n.left];

            return [n.left, n.right];
          })}
        />
      )}
    </>
  );
}

export default VisualizeTreeLayer;
