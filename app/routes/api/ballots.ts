import { ActionFunctionArgs } from "@remix-run/node";
import { db } from "@/db.server";

export async function action({ request }: ActionFunctionArgs) {
  switch (request.method.toUpperCase()) {
    case "POST": {
      const formData = await request.formData();

      const amountOfBallots = Number(formData.get("amountOfBallots"));

      if (isNaN(amountOfBallots)) {
        return new Response("Invalid number of ballots", {
          status: 400,
        });
      }

      const ballotLength = process.env.BALLOT_LENGTH;

      if (!ballotLength || isNaN(Number(ballotLength))) {
        return new Response("Ballot length not set", {
          status: 500,
        });
      }

      await db.ballot.deleteMany({});

      const numberSpace = 2 ** Number(ballotLength);

      // Equally divide the number space into the amount of ballots, and turn each number into a binary string.
      const numbersPerBallot = Math.floor(numberSpace / amountOfBallots);

      const ballots = Array.from({ length: amountOfBallots }, (_, i) => {
        const baseValue = i * numbersPerBallot + numbersPerBallot / 2;

        const randomness =
          Math.random() *
          (numbersPerBallot / 2) *
          (Math.random() >= 0.5 ? 1 : -1);

        const id = Math.floor(baseValue + randomness)
          .toString(2)
          .padStart(Number(ballotLength), "0");

        return { id };
      });

      await db.ballot.createMany({
        data: ballots,
      });

      return new Response("success", {
        status: 200,
      });
    }
    case "DELETE": {
      // Delete all the existing tree nodes.
      await Promise.all([
        db.ballot.deleteMany(),
        db.merkleNode.deleteMany(),
        db.radixNode.deleteMany(),
      ]);

      return new Response("success", {
        status: 200,
      });
    }
  }
}
