import { calculateIsDue } from "../../src/lib/dateUtils.ts";

describe("dateUtils - calculateIsDue", () => {
  it("returns false if reviewDurationDays is null or undefined", () => {
    expect(calculateIsDue(new Date(), null)).toBe(false);
    expect(calculateIsDue(new Date(), undefined)).toBe(false);
  });

  it("returns false if reviewDurationDays is 0", () => {
    expect(calculateIsDue(new Date(), 0)).toBe(false);
  });

  it("returns false if not enough days have elapsed", () => {
    const today = new Date();
    // Set last attempted date to yesterday
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    // Requires 2 days, only 1 day elapsed
    expect(calculateIsDue(yesterday, 2)).toBe(false);
  });

  it("returns true if exact days have elapsed", () => {
    const today = new Date();
    // Exactly 2 days ago
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    
    // Requires 2 days, 2 days elapsed
    expect(calculateIsDue(twoDaysAgo, 2)).toBe(true);
  });

  it("returns true if more than enough days have elapsed", () => {
    const today = new Date();
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    // Requires 2 days, 3 days elapsed
    expect(calculateIsDue(threeDaysAgo, 2)).toBe(true);
  });

  it("works correctly with a string date input", () => {
    const today = new Date();
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    
    expect(calculateIsDue(twoDaysAgo, 2)).toBe(true);
  });
  
  it("ignores the time component when calculating days", () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0); // Very beginning of the day 2 days ago
    
    expect(calculateIsDue(twoDaysAgo, 2)).toBe(true);
  });
});
