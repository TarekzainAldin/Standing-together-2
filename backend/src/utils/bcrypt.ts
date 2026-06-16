import bcrypt from "bcrypt";

export const hashValue = async (value: string, saltRounds: number = 10) =>
  await bcrypt.hash(value, saltRounds);

export const compareValue = async (value: string, hashedValue?: string) =>
  hashedValue ? await bcrypt.compare(value, hashedValue) : false;