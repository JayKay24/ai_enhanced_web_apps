import { Card } from "../ui/card";

const ChatBubbleLoading: React.FC = () => {
  return (
    <Card className="p-5 flex items-center gap-3 justify-center w-fit max-w-[75%] border-none">
      <p className="font-semibold">
        Please{" "}
        <span role="img" aria-label="folded hands">
          🙏
        </span>{" "}
        Wait...
      </p>
    </Card>
  );
};

export default ChatBubbleLoading;