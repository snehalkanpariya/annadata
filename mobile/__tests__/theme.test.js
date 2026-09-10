import { colors } from "../src/theme/colors";

describe("Design System Theme Palette", () => {
  test("Primary Forest Green colors match exact specification", () => {
    expect(colors.primary).toBe("#16A34A");
    expect(colors.primaryDark).toBe("#15803D");
  });

  test("Secondary Harvest Gold / Amber colors match specification", () => {
    expect(colors.secondary).toBe("#F59E0B");
  });

  test("Background & elevated card colors match specification", () => {
    expect(colors.background).toBe("#F8FAFC");
    expect(colors.cardBg).toBe("#FFFFFF");
  });
});
