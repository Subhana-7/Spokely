import User from "../models/user.model";

export class UserRepository {
  async findByEmail(email: String) {
    return User.findOne({ email });
  }

  async createUser(data: any) {
    return User.create(data);
  }

  async findByReferalCode(code: String) {
    return User.findOne({ referalCode: code });
  }

  async updateOTP(email: string, code: string, expiresAt: Date) {
    return User.findOneAndUpdate(
      { email },
      { otp: { code, expiresAt } },
      { new: true }
    );
  }

  async verifyOTP(email: string, code: string) {
    const user = await User.findOne({ email });

    if (!user || !user.otp || user.otp.code !== code) return false;

    const now = new Date();
    if (now > user.otp.expiresAt) return false;

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    return true;
  }

  async updateUserRole(userId: string, role: "user" | "mentor") {
    return User.findByIdAndUpdate(userId, { role }, { new: true });
  }

  async findAll() {
    return await User.find({}, "-password -otp -googleId");
  }
}
