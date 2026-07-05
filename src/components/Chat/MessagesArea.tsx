import { UserMessage } from "./UserMessage";
import { AIMessage } from "./AIMessage";
import {
  ai1Text1,
  ai1Text2,
  ai2Text1,
  codeBlock1,
  codeBlock2,
  user1Text,
  user2Text,
} from "../../data/mockData";

export function MessagesArea() {
  return (
    <div className="flex flex-col gap-6 px-12 py-6">
      <UserMessage text={user1Text} />
      <AIMessage
        text={ai1Text1}
        codeBlock={codeBlock1}
        followUpText={ai1Text2}
      />
      <UserMessage text={user2Text} />
      <AIMessage text={ai2Text1} codeBlock={codeBlock2} />
    </div>
  );
}
