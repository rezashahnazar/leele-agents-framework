import { type FC } from "react";
import { type Metadata } from "next";
import { LeelEAgentUI } from "@/components/features/agent-ui";

export const metadata: Metadata = {
  title: "Creative Writer | LeelE Agent",
  description: "LeelE Agent Interface",
};

const Home: FC = () => {
  return (
    <main className="min-h-screen w-full">
      <LeelEAgentUI apiUrl="/api/creative-writer" />
    </main>
  );
};

export default Home;
