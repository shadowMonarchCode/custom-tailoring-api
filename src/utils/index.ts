const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Function to hash a password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

// Function to authenticate and generate a JWT token
export const authenticate = async (
  password: string,
  user_password: string,
  userId: string,
  role: string
): Promise<string | null> => {
  try {
    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user_password);

    // If passwords match, generate and return a JWT token
    if (passwordMatch) {
      const token = jwt.sign(
        { userId: userId, role: role },
        "superhumanisthekeytoextinction",
        { expiresIn: "1d" }
      );

      return token;
    }

    // If passwords do not match, return null
    return null;
  } catch (error) {
    console.error(error);
    // Handle any errors that may occur during the authentication process
    return null;
  }
};
