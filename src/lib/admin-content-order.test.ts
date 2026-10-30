import { describe, expect, it } from "vitest";
import { publishedFirst } from "./admin-content-order";
import { derivePublicationState, type SchedulableContent } from "./news-schedule";

it("đưa bài đã đăng lên trước, giữ thứ tự trong hai nhóm và không sửa nguồn", () => {
  const items = Object.freeze([
    { id: "hidden-first", status: "DRAFT" as const },
    { id: "public-ordered-first", status: "PUBLISHED" as const },
    { id: "waiting", status: "PENDING" as const },
    { id: "public-ordered-last", status: "PUBLISHED" as const },
  ]);
  expect(publishedFirst(items, (item) => item.status).map((item) => item.id)).toEqual([
    "public-ordered-first", "public-ordered-last", "hidden-first", "waiting",
  ]);
  expect(items[0].id).toBe("hidden-first");
});

describe("ưu tiên theo trạng thái hiện tại thay vì lịch sử đăng", () => {
  const now = new Date("2026-10-30T10:00:00Z");
  const past = "2026-10-30T09:00:00Z";
  const future = "2026-10-30T11:00:00Z";
  const items: (SchedulableContent & { id: string })[] = [
    { id: "hidden-after-publish", status: "DRAFT", publishedAt: past, scheduledAt: null },
    { id: "future", status: "PENDING", publishedAt: future, scheduledAt: future },
    { id: "due", status: "PENDING", publishedAt: past, scheduledAt: past },
    { id: "published", status: "PUBLISHED", publishedAt: past, scheduledAt: null },
  ];
  it("lịch tới hạn đứng cùng nhóm đã đăng, lịch tương lai và bài đã ẩn đứng sau", () => {
    expect(publishedFirst(items, (item) => derivePublicationState(item, now)).map((item) => item.id)).toEqual([
      "due", "published", "hidden-after-publish", "future",
    ]);
  });
  it("đổi nhóm ngay khi lịch tới hạn", () => {
    expect(publishedFirst(items, (item) => derivePublicationState(item, new Date(future))).map((item) => item.id)).toEqual([
      "future", "due", "published", "hidden-after-publish",
    ]);
  });
});
