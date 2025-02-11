import { db } from "@/db.server";

export async function loader() {
  // Return a random ballot ID
  const ballotCount = await db.ballot.count();

  const randomBallot = await db.ballot.findFirst({
    skip: Math.floor(Math.random() * ballotCount),
  });

  return {
    ballotId: randomBallot?.id,
  };
}
