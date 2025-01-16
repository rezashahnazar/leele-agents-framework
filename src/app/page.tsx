import { type FC } from "react";
import { type Metadata } from "next";
import { LeelEAgentUI } from "@/components/features/agent-ui";

export const metadata: Metadata = {
  title: "Simple Agent | LeelE Agent",
  description: "LeelE Agent Interface",
};

const Home: FC = () => {
  return (
    <main className="min-h-screen w-full">
      <LeelEAgentUI
        apiUrl="/api/agent"
        title="LeelE Agent"
        description="The LeelE Agent is a powerful AI agent that can help you with a wide range of tasks!"
      />
    </main>
  );
};

export default Home;
