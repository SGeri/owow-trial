import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarkdownContent } from "./markdown-content";

describe("MarkdownContent", () => {
  it("renders nothing for empty content", () => {
    const { container } = render(<MarkdownContent content="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders GFM emphasis, lists, and tables", () => {
    render(
      <MarkdownContent
        content={[
          "**bold** and `code`",
          "",
          "- one item",
          "",
          "| Week | Status |",
          "| --- | --- |",
          "| 1 | active |",
        ].join("\n")}
      />,
    );

    expect(screen.getByText("bold").tagName).toBe("STRONG");
    expect(screen.getByText("code").tagName).toBe("CODE");
    expect(screen.getByRole("listitem")).toHaveTextContent("one item");
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "active" })).toBeInTheDocument();
  });
});
