import { expect, it } from "vitest";
import { render } from "@testing-library/react";
import { HCStyledProvider } from "../../src/HCStyledProvider";
import React from "react";
import { HCIcon } from "../../src/HCIcon";

it("should test a default HCIcon - ActionIcon", () => {
  const result = render(
    <HCStyledProvider>
      <HCIcon icon={"ActionIcon"} />
    </HCStyledProvider>
  );

  expect(result).toMatchSnapshot();
});

it("should test a default HCIcon - Trasn", () => {
  const result = render(
    <HCStyledProvider>
      <HCIcon icon={"Trash"} />
    </HCStyledProvider>
  );

  expect(result).toMatchSnapshot();
});

it("should test a default HCIcon - ExpressionlessFaceIcon", () => {
  const result = render(
    <HCStyledProvider>
      <HCIcon icon={"ExpressionlessFace"} />
    </HCStyledProvider>
  );

  expect(result).toMatchSnapshot();
});
