const BlockedScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-4xl font-bold mb-3 text-red-400">Account Blocked</h1>
      <p className="text-gray-300 text-lg max-w-md text-center">
        Your account has been blocked by the administrators. If you believe this
        is a mistake, please contact support.
      </p>
    </div>
  );
};

export default BlockedScreen;
