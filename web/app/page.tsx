import { HomeChatView } from "@/components/editor/home-chat-view";
import { generateUUID } from "@/lib/utils";

export default async function HomePage() {
  const chatId = generateUUID();

  return <HomeChatView chatId={chatId} />;
}
