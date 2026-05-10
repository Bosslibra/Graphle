import { render, screen } from "@testing-library/react";
import NotFoundPage from "../../../app/[locale]/not-found";

describe("[locale]/not-found page", () => {
  test("shows a not found message and a home link", async () => {
    // Call the async server component function like Next does
    const ui = await NotFoundPage();

    render(ui);

    // Check title
    expect(
      screen.getByRole("heading", { name: /page not found/i })
    ).toBeInTheDocument();

    // Check description text
    expect(
      screen.getByText(/could not find requested resource/i)
    ).toBeInTheDocument();

    // Check the "Go back home" link is there
    expect(screen.getByRole("link", { name: /go back home/i })).toBeInTheDocument();
  });
});