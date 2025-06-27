import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";

export class UserService {
  private repo = new UserRepository();

  private async generateUniqueReferralCode(): Promise<string> {
    const generateRandom = () =>
      Math.random().toString(36).substring(2, 8).toUpperCase();
    let code = generateRandom();
    let exists = await this.repo.findByReferalCode(code);

    while (exists) {
      code = generateRandom();
      exists = await this.repo.findByReferalCode(code);
    }
    return code;
  }

  private async passwordValidation(password: string): Promise<void> {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      throw new Error(
        "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character."
      );
    }
  }

  async signup(data: any) {
    //change any
    await this.passwordValidation(data.password);

    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw new Error("Email Already in use");
    const hashed = await bcrypt.hash(data.password, 10);
    const referalCode = await this.generateUniqueReferralCode();

    return this.repo.createUser({
      ...data,
      password: hashed,
      referalCode,
    });
  }

  async login(data: any) {
    const user = await this.repo.findByEmail(data.email);
    if (!user) throw new Error("Invalid email or password");

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new Error("Invalid email or password");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });
    return { user, token };
  }
}
