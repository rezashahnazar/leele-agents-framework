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
      <LeelEAgentUI apiUrl="/api/agent" />
    </main>
  );
};

export default Home;
