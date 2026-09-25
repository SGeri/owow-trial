import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { assistantMessage, userMessage } from "@/test/fixtures/messages";

import { ChatMessages } from "./chat-messages";

describe("ChatMessages", () => {
  it("shows the empty exercise prompt", () => {
    render(<ChatMessages messages={[]} status="ready" />);
    expect(screen.getByText("This week's exercise")).toBeInTheDocument();
    expect(
      screen.getByText("Write what happened. Otto answers with one clear next cue."),
    ).toBeInTheDocument();
  });

  it("renders the member and Otto", () => {
    render(
      <ChatMessages
        messages={[
          userMessage("I postponed it."),
          assistantMessage("**Next cue:** ask them."),
        ]}
        status="ready"
      />,
    );

    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("I postponed it.")).toBeInTheDocument();
    expect(screen.getByText("Otto")).toBeInTheDocument();
    expect(screen.getByText("Next cue:")).toBeInTheDocument();
  });

  it("shows a spinner while Otto is streaming or the reply is pending", () => {
    const { rerender } = render(
      <ChatMessages
        messages={[userMessage("I postponed it.")]}
        status="submitted"
      />,
    );
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();

    rerender(
      <ChatMessages
        messages={[
          userMessage("I postponed it."),
          assistantMessage("Next cue:"),
        ]}
        status="streaming"
      />,
    );
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });
});
