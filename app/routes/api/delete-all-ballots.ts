import { db } from "@/db.server";

export async function action() {
  // Delete all the existing tree nodes.
  await db.node.deleteMany();

  return new Response("success", {
    status: 200,
  });
}
