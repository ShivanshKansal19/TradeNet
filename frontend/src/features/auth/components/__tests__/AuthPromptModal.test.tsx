import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthPromptModal from "../AuthPromptModal";

describe("AuthPromptModal", () => {
  it("does not render when isOpen is false", () => {
    render(
      <MemoryRouter>
        <AuthPromptModal isOpen={false} onClose={() => {}} />
      </MemoryRouter>
    );
    expect(screen.queryByTestId("auth-prompt-modal")).not.toBeInTheDocument();
  });

  it("renders portfolio prompt with stock symbol and preserved redirect links", () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter initialEntries={["/stocks/RELIANCE"]}>
        <AuthPromptModal
          isOpen={true}
          onClose={handleClose}
          actionType="portfolio"
          stockSymbol="RELIANCE"
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId("auth-prompt-modal")).toBeInTheDocument();
    expect(screen.getByText("Sign In to Manage Portfolios")).toBeInTheDocument();
    expect(screen.getByText(/add RELIANCE to your portfolio/i)).toBeInTheDocument();

    const loginLink = screen.getByTestId("auth-prompt-login-link");
    expect(loginLink).toHaveAttribute("href", expect.stringContaining("/login"));
    expect(loginLink).toHaveAttribute("href", expect.stringContaining("redirect=%2Fstocks%2FRELIANCE"));

    const registerLink = screen.getByTestId("auth-prompt-register-link");
    expect(registerLink).toHaveAttribute("href", expect.stringContaining("/register"));
    expect(registerLink).toHaveAttribute("href", expect.stringContaining("redirect=%2Fstocks%2FRELIANCE"));

    const closeBtn = screen.getByTestId("auth-prompt-close-button");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders watchlist prompt with stock symbol", () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter initialEntries={["/screener"]}>
        <AuthPromptModal
          isOpen={true}
          onClose={handleClose}
          actionType="watchlist"
          stockSymbol="TCS"
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Sign In to Save Watchlist")).toBeInTheDocument();
    expect(screen.getByText(/save TCS to your personal watchlist/i)).toBeInTheDocument();

    const cancelBtn = screen.getByTestId("auth-prompt-cancel-button");
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
