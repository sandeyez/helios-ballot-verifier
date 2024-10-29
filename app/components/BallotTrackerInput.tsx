import { ChangeEvent, useEffect, useState } from "react";
import { Input } from "./ui/input";

type BallotTrackerInputProps = {
  value: string;
  onChange: (value: string) => void;
};

function BallotTrackerInput({
  value,
  onChange,
}: BallotTrackerInputProps): JSX.Element {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    // Check if any of the digits is different than 0 or 1
    if (e.target.value.split("").some((c) => c !== "0" && c !== "1")) {
      return;
    }

    onChange(e.target.value);
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder="Enter ballot tracker..."
    />
  );
}

export default BallotTrackerInput;
