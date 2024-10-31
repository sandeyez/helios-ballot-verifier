import { db } from "@/db.server";
import { generateRandomBinaryString } from "@/lib/utils";
import { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const amountOfBallots = Number(formData.get("amountOfBallots"));

  if (isNaN(amountOfBallots)) {
    return new Response("Invalid number of ballots", {
      status: 400,
    });
  }

  const ballotLength = process.env.BALLOT_LENGTH;

  if (!ballotLength) {
    return new Response("Ballot length not set", {
      status: 500,
    });
  }

  await db.node.deleteMany({
    where: {
      isLeaf: false,
    },
  });

  const existingBallots = await db.node.findMany({
    where: {
      isLeaf: true,
    },
  });

  // Generate random ballots that are not already in the database
  let ballots = Array.from({ length: amountOfBallots }, () =>
    generateRandomBinaryString(Number(ballotLength))
  );

  // Remove duplicates from the ballots array
  ballots = [...new Set(ballots)];

  // Remove existing ballots from the ballots array
  ballots = ballots.filter(
    (ballot) =>
      !existingBallots.some((existingBallot) => existingBallot.id === ballot)
  );

  try {
    await db.node.createMany({
      data: ballots.map((ballot) => ({
        isLeaf: true,
        id: ballot,
        value: ballot,
      })),
    });
  } catch (error) {
    console.error(error);
    return new Response("Error adding ballots", {
      status: 500,
    });
  }

  return new Response("success", {
    status: 200,
  });
}
