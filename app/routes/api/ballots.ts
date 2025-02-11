import { ActionFunctionArgs } from "@remix-run/node";
import { db } from "@/db.server";

export async function action({ request }: ActionFunctionArgs) {
  switch (request.method.toUpperCase()) {
    // If a post request is received, a given number of random ballots are generated and added to the database.
    case "POST": {
      // Get the amount of ballots from the form data
      const formData = await request.formData();
      const amountOfBallots = Number(formData.get("amountOfBallots"));

      // If the amount of ballots is not a number, return an error
      if (isNaN(amountOfBallots)) {
        return new Response("Invalid number of ballots", {
          status: 400,
        });
      }

      // Get the ballot length from the environment variables
      const ballotLength = process.env.BALLOT_LENGTH;

      if (!ballotLength || isNaN(Number(ballotLength))) {
        return new Response("Ballot length not set", {
          status: 500,
        });
      }

      // Delete all the existing ballots
      await db.ballot.deleteMany({});

      // Calculate the amount of possible ballots with the given ballot length
      const numberSpace = 2 ** Number(ballotLength);

      // Equally divide the number space into the amount of ballots, and turn each number into a binary string.
      const numbersPerBallot = Math.floor(numberSpace / amountOfBallots);

      // Generate one ballot for each number, and add some randomness to the value.
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

      // Create the ballots in the database
      await db.ballot.createMany({
        data: ballots,
      });

      return new Response("success", {
        status: 200,
      });
    }
    // If a delete request is received, all the existing tree nodes are deleted.
    case "DELETE": {
      // Delete all the existing tree nodes.
      await db.$transaction([
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
