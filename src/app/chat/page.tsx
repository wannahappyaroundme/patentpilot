import { ChatCopilot } from "@/components/chat-copilot";

export const metadata = {
  title: "AI 코파일럿 — PatentPilot",
};

export default function ChatPage() {
  return (
    <div className="py-6">
      <ChatCopilot />
    </div>
  );
}
