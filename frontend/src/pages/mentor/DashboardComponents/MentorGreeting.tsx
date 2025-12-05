const MentorGreeting = ({ mentor }: { mentor?: any }) => {
  const name = mentor?.name || "Mentor";
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Hello {name},</h1>
      <p className="text-lg text-gray-600">
        Ready to inspire your students today?
      </p>
    </div>
  );
};

export default MentorGreeting;
