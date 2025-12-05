import React, { useState } from "react";
import { Users } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import Toggle from "./Toggle";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (role: "user" | "mentor") => void;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  onContinue,
}) => {
  const [selectedRole, setSelectedRole] = useState<"user" | "mentor">("user");

  const roleOptions = [
    { value: "user", label: "User" },
    { value: "mentor", label: "Mentor" },
  ];

  const handleContinue = () => {
    onContinue(selectedRole);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kindly select one of the above"
      icon={<Users className="h-6 w-6 text-gray-800" />}
    >
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-gray-800 mb-6">
            Choose your role to get started with Spokely and unlock personalized
            features.
          </p>
        </div>

        <Toggle
          options={roleOptions}
          selected={selectedRole}
          onChange={(value) => setSelectedRole(value as "user" | "mentor")}
        />

        <div className="space-y-4">
          <div className="bg-white/20 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              {selectedRole === "user" ? "As a User:" : "As a Mentor:"}
            </h4>
            <p className="text-sm text-gray-800">
              {selectedRole === "user"
                ? "Access personalized learning sessions, track your progress, and connect with expert mentors to improve your communication skills."
                : "Share your expertise, mentor passionate learners, and build your reputation in the communication training community."}
            </p>
          </div>

          <Button variant="primary" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RoleSelectionModal;
