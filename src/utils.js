import RelativeTime from "@yaireo/relative-time";

const relativeTime = new RelativeTime();

export function calcDaysLeft(dueDate) {
  return relativeTime.from(new Date(dueDate));
}
