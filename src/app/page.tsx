import { type FC } from "react";
import { type Metadata } from "next";
import { LeelEAgentUI } from "@/components/features/agent-ui";

export const metadata: Metadata = {
  title: "LeelE | Smart Assistant",
  description: "A powerful framework for building intelligent assistants",
};

const Home: FC = () => {
  return (
    <main className="min-h-screen w-full">
      <LeelEAgentUI
        apiUrl="/api/agent"
        title="LeelE"
        description="Smart Assistant"
      />
    </main>
  );
};

export default Home;
