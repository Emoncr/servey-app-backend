import User, { IUser } from "../models/User.model";
import { SigninInput, SignupInput } from "../schemas/auth.schema";
import { AuthResult, UserDTO } from "../types";
import { ApiError } from "../utils/ApiError";
import { generateToken } from "../utils/generateToken";

const toUserDTO = (user: IUser): UserDTO => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt?.toISOString(),
  updatedAt: user.updatedAt?.toISOString(),
});

export const signup = async (input: SignupInput): Promise<AuthResult> => {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role: "admin",
  });

  return {
    user: toUserDTO(user),
    token: generateToken(user.id, user.role),
  };
};

export const signin = async (input: SigninInput): Promise<AuthResult> => {
  const user = await User.findOne({ email: input.email }).select("+password");

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  return {
    user: toUserDTO(user),
    token: generateToken(user.id, user.role),
  };
};

export const getMe = async (userId: string): Promise<UserDTO> => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.unauthorized("The account for this session no longer exists");
  }
  return toUserDTO(user);
};
