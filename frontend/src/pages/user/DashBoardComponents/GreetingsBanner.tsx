import { useAuthStore } from '../../../store/userAuthStore';

const GreetingBanner = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="rounded-2xl p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">
        Hey {user?.name || "there"}! 👋
      </h1>
      <p className="text-lg opacity-90">
        Ready to level up your communication skills today?
      </p>
    </div>
  );
};

export default GreetingBanner;
