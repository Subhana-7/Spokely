import { ChevronRight } from "lucide-react";

const DailyChallengeCard = () => {
  const challenges = [
    { text: "Writing Task" },
    { text: "Reading Task" },
    { text: "Speaking Task" },
    { text: "Listening Task" },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-4">Daily Challenge</h3>
      <div className="space-y-3">
        {challenges.map((challenge, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
          >
            <span className="text-sm font-medium">{challenge.text}</span>
            <ChevronRight className="w-4 h-4 text-lime-400" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyChallengeCard;
