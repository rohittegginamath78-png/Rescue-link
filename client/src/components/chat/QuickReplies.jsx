import { QUICK_REPLIES } from "../../constants/animals";
import Pill from "../ui/Pill";

export default function QuickReplies({ onSelect, hidden = false }) {
  if (hidden) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {QUICK_REPLIES.map((reply) => (
        <Pill key={reply} tone="gray" onClick={() => onSelect(reply)}>
          {reply}
        </Pill>
      ))}
    </div>
  );
}
