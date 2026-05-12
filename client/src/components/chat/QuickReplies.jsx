import { QUICK_REPLIES } from "../../constants/animals";
import Pill from "../ui/Pill";

const FIND_RESCUER_REPLY = "Find a rescuer near me";

export default function QuickReplies({
  onSelect,
  onFindRescuer,
  hidden = false,
}) {
  if (hidden) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {QUICK_REPLIES.map((reply) => {
        const isFindRescuerReply = reply === FIND_RESCUER_REPLY;

        return (
          <Pill
            key={reply}
            tone="gray"
            onClick={() =>
              isFindRescuerReply ? onFindRescuer() : onSelect(reply)
            }
          >
            {reply}
          </Pill>
        );
      })}
    </div>
  );
}
