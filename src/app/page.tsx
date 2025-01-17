import { type FC } from "react";
import { type Metadata } from "next";
import { LeelEAgentUI } from "@/components/features/agent-ui";

export const metadata: Metadata = {
  title: "LeelE | دستیار هوشمند",
  description: "رابط کاربری دستیار لیله",
};

const Home: FC = () => {
  return (
    <main className="min-h-screen w-full">
      <LeelEAgentUI
        apiUrl="/api/agent"
        title="LeelE"
        description="دستیار هوشمند"
      />
    </main>
  );
};

export default Home;
