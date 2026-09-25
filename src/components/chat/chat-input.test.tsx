import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChatInput } from "./chat-input";

describe("ChatInput", () => {
  it("blocks an empty or whitespace message", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput disabled={false} onSend={onSend} />);

    const send = screen.getByRole("button", { name: "Send" });
    expect(send).toBeDisabled();

    await user.type(screen.getByRole("textbox"), "   ");
    expect(send).toBeDisabled();
    expect(onSend).not.toHaveBeenCalled();
  });

  it("sends on Enter and clears the field", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput disabled={false} onSend={onSend} />);

    const field = screen.getByRole("textbox");
    await user.type(field, "I postponed it{Enter}");

    expect(onSend).toHaveBeenCalledWith("I postponed it");
    expect(field).toHaveValue("");
  });

  it("inserts a newline on Shift+Enter without sending", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput disabled={false} onSend={onSend} />);

    const field = screen.getByRole("textbox");
    await user.type(field, "line one{Shift>}{Enter}{/Shift}line two");

    expect(onSend).not.toHaveBeenCalled();
    expect(field).toHaveValue("line one\nline two");
  });

  it("does not send while disabled", () => {
    const onSend = vi.fn();
    render(<ChatInput disabled onSend={onSend} />);

    const field = screen.getByRole("textbox");
    expect(field).toBeDisabled();
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    expect(onSend).not.toHaveBeenCalled();
  });
});
