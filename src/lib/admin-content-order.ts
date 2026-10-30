import type { PublicationState } from "./news-schedule";

/** Chỉ nhóm danh sách CMS; giữ nguyên thứ tự API trong từng nhóm, không sửa cache. */
export function publishedFirst<T>(
  items: readonly T[],
  stateOf: (item: T) => PublicationState,
): T[] {
  const published: T[] = [];
  const unpublished: T[] = [];
  for (const item of items) {
    const state = stateOf(item);
    (state === "PUBLISHED" || state === "DUE" ? published : unpublished).push(item);
  }
  return [...published, ...unpublished];
}
