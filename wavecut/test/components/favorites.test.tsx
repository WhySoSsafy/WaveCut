import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FavoritesProvider, useFavorites } from "@/components/mobile/FavoritesProvider";
import { FavoritesList } from "@/components/mobile/FavoritesList";
import type { BeachSummary } from "@/lib/api/aggregate";

// ---- fixtures ----
const BEACH_A: BeachSummary = {
  id: "haeundae",
  name: "해운대 해수욕장",
  region: "부산 해운대구",
  status: "safe",
  score: 86,
  sky: "맑음",
  air: 27,
  uv: "높음",
  crowd: "보통",
};

const BEACH_B: BeachSummary = {
  id: "gwangalli",
  name: "광안리 해수욕장",
  region: "부산 수영구",
  status: "safe",
  score: 80,
  sky: "구름",
  air: 25,
  uv: "보통",
  crowd: "많음",
};

const ALL_BEACHES = [BEACH_A, BEACH_B];

// ---- helper: consumer that can toggle favorites ----
function ToggleConsumer({ id }: { id: string }) {
  const { toggle, isFavorite } = useFavorites();
  return (
    <div>
      <span data-testid="state">{isFavorite(id) ? "on" : "off"}</span>
      <button onClick={() => toggle(id)}>toggle</button>
    </div>
  );
}

// ---- clear localStorage between tests ----
beforeEach(() => {
  localStorage.clear();
});

describe("FavoritesProvider", () => {
  it("초기 상태는 즐겨찾기 없음(off)", () => {
    render(
      <FavoritesProvider>
        <ToggleConsumer id="haeundae" />
      </FavoritesProvider>
    );
    expect(screen.getByTestId("state").textContent).toBe("off");
  });

  it("toggle 호출 시 isFavorite가 off → on으로 전환된다", () => {
    render(
      <FavoritesProvider>
        <ToggleConsumer id="haeundae" />
      </FavoritesProvider>
    );
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("state").textContent).toBe("on");
  });

  it("toggle을 두 번 호출하면 on → off로 돌아온다", () => {
    render(
      <FavoritesProvider>
        <ToggleConsumer id="haeundae" />
      </FavoritesProvider>
    );
    fireEvent.click(screen.getByText("toggle"));
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("state").textContent).toBe("off");
  });
});

describe("FavoritesList", () => {
  it("즐겨찾기가 0개면 빈 상태 문구를 표시한다", () => {
    render(
      <FavoritesProvider>
        <FavoritesList beaches={ALL_BEACHES} />
      </FavoritesProvider>
    );
    expect(screen.getByText("아직 즐겨찾기한 해수욕장이 없습니다")).toBeDefined();
  });

  it("즐겨찾기를 추가하면 해당 해변 카드가 렌더된다", () => {
    // Render a composite: toggle button + FavoritesList share the same provider
    function TestApp() {
      const { toggle } = useFavorites();
      return (
        <div>
          <button onClick={() => toggle("haeundae")}>add-haeundae</button>
          <FavoritesList beaches={ALL_BEACHES} />
        </div>
      );
    }

    render(
      <FavoritesProvider>
        <TestApp />
      </FavoritesProvider>
    );

    // Initially empty state
    expect(screen.getByText("아직 즐겨찾기한 해수욕장이 없습니다")).toBeDefined();

    // Toggle on
    fireEvent.click(screen.getByText("add-haeundae"));

    // Beach card should now appear
    expect(screen.getByText("해운대 해수욕장")).toBeDefined();
    // Other beach should not be in the list
    expect(screen.queryByText("광안리 해수욕장")).toBeNull();
  });

  it("즐겨찾기를 추가하면 빈 상태 문구가 사라진다", () => {
    function TestApp() {
      const { toggle } = useFavorites();
      return (
        <div>
          <button onClick={() => toggle("gwangalli")}>add-gwangalli</button>
          <FavoritesList beaches={ALL_BEACHES} />
        </div>
      );
    }

    render(
      <FavoritesProvider>
        <TestApp />
      </FavoritesProvider>
    );

    fireEvent.click(screen.getByText("add-gwangalli"));
    expect(screen.queryByText("아직 즐겨찾기한 해수욕장이 없습니다")).toBeNull();
    expect(screen.getByText("광안리 해수욕장")).toBeDefined();
  });
});
