
const TipOfTheDayCard = () => {
  return (
    <div className="bg-lime-400 rounded-2xl p-6 text-white">
      <div className="flex items-start space-x-4">
        <div className="text-2xl">💡</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2">Tip of the Day</h3>
          <p className="text-sm opacity-90 leading-relaxed">
            Strategic pauses in conversation give you time to think and make your words more impactful. 
            Practice taking a brief moment before responding to show confidence and thoughtfulness.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TipOfTheDayCard;
