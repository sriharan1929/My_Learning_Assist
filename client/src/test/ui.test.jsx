import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "../pages/login-page.jsx";
import { ProgressBar } from "../components/common/status.jsx";
import { ResourceCard } from "../features/resources/resource-card.jsx";

describe("UI", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders demo login access", () => {
    render(<MemoryRouter><LoginPage onLogin={() => {}} /></MemoryRouter>);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue("demo@learningos.dev")).toBeInTheDocument();
  });

  it("renders accessible progress", () => {
    render(<ProgressBar value={42} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "42");
  });

  it("renders resource card with title and stats", () => {
    const item = {
      id: "roadmap-1",
      title: "React Mastery",
      description: "A comprehensive roadmap.",
      steps: [
        { id: "step-1", title: "Learn components", done: true },
        { id: "step-2", title: "Learn hooks", done: false }
      ]
    };
    render(<ResourceCard item={item} name="roadmaps" onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText("React Mastery")).toBeInTheDocument();
    expect(screen.getByText("50% complete")).toBeInTheDocument();
    expect(screen.getByText("2 steps")).toBeInTheDocument();
  });

  it("toggles steps list expand state and submits new step", () => {
    const item = {
      id: "roadmap-1",
      title: "React Mastery",
      description: "A comprehensive roadmap.",
      steps: [
        { id: "step-1", title: "Learn components", done: true }
      ]
    };
    const addNested = { mutate: vi.fn() };
    const updateNested = { mutate: vi.fn() };
    const removeNested = { mutate: vi.fn() };

    render(
      <ResourceCard
        item={item}
        name="roadmaps"
        onEdit={() => {}}
        onDelete={() => {}}
        addNested={addNested}
        updateNested={updateNested}
        removeNested={removeNested}
      />
    );

    // Expand step management
    const manageBtn = screen.getByRole("button", { name: /manage \(1\)/i });
    fireEvent.click(manageBtn);

    // Check if the step text is visible
    expect(screen.getByText("1. Learn components")).toBeInTheDocument();

    // Fill in the input field to add new step
    const input = screen.getByPlaceholderText(/add roadmap step/i);
    fireEvent.change(input, { target: { value: "Learn routing" } });

    // Click submit/add
    const addBtn = screen.getByRole("button", { name: /add/i });
    fireEvent.click(addBtn);

    expect(addNested.mutate).toHaveBeenCalledWith({
      id: "roadmap-1",
      field: "steps",
      values: { title: "Learn routing", done: false }
    });
  });

  it("triggers step completion toggle", () => {
    const item = {
      id: "roadmap-1",
      title: "React Mastery",
      description: "A comprehensive roadmap.",
      steps: [
        { id: "step-1", title: "Learn components", done: false }
      ]
    };
    const addNested = { mutate: vi.fn() };
    const updateNested = { mutate: vi.fn() };
    const removeNested = { mutate: vi.fn() };

    render(
      <ResourceCard
        item={item}
        name="roadmaps"
        onEdit={() => {}}
        onDelete={() => {}}
        addNested={addNested}
        updateNested={updateNested}
        removeNested={removeNested}
      />
    );

    // Expand step management
    fireEvent.click(screen.getByRole("button", { name: /manage/i }));

    // Toggle check
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(updateNested.mutate).toHaveBeenCalledWith({
      id: "roadmap-1",
      field: "steps",
      nestedId: "step-1",
      values: { done: true }
    });
  });
});
