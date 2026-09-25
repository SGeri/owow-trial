import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    expect(screen.queryByRole("button", { name: "Prior work" })).not.toBeInTheDocument();
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
    expect(screen.queryByRole("button", { name: "Prior work" })).not.toBeInTheDocument();
  });

  it("opens prior work when the reply used no earlier records", async () => {
    const user = userEvent.setup();
    render(
      <ChatMessages
        messages={[
          userMessage("I postponed it."),
          {
            ...assistantMessage("Next cue: ask them."),
            metadata: { citations: [] },
          },
        ]}
        status="ready"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Prior work" }));
    expect(
      screen.getByText("No prior work shaped this reply."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("This reply stands on this week's message."),
    ).toBeInTheDocument();
  });

  it("opens the records a reply actually used", async () => {
    const user = userEvent.setup();
    render(
      <ChatMessages
        messages={[
          userMessage("I postponed it."),
          {
            ...assistantMessage("Next cue: ask them."),
            metadata: {
              citations: [
                {
                  recordId: "ex-101-1",
                  week: 1,
                  type: "exercise",
                  text: "I postponed a difficult conversation.",
                  explanation: "The reply stays on that postponed conversation.",
                },
              ],
            },
          },
        ]}
        status="ready"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Prior work" }));
    expect(
      screen.getByText("I postponed a difficult conversation."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The reply stays on that postponed conversation."),
    ).toBeInTheDocument();
    expect(screen.getByText("Why it mattered")).toBeInTheDocument();
    expect(screen.getByText("week 1 exercise")).toBeInTheDocument();
  });
});
