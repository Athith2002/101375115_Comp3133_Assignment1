const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ApolloError } = require("apollo-server-express");

const userResolver = {
  Mutation: {
    signup: async (_, { input }) => {
      try {
        const storedUser = await User.findOne({
          $or: [{ username: input.username }, { email: input.email }],
        });

        if (storedUser) {
          throw new ApolloError(
            "Username or email already taken",
            "DUPLICATE_USER"
          );
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);

        const newSavedUser = new User({
          username: input.username,
          email: input.email,
          password: hashedPassword,
        });

        const user = await newSavedUser.save();

        const token = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET_STRING,
          {
            expiresIn: "2h",
          }
        );

        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          password: user.password,
          token,
        };
      } catch (error) {
        throw new ApolloError(`Error ${error.message}`, "LOGIN_ERROR");
      }
    },
  },
  Query: {
    login: async (_, { username, password }) => {
      try {
        // Find the user by username or email
        const user = await User.findOne({
          $or: [{ username }, { email: username }],
        });

        if (!user) {
          throw new ApolloError("User not found", "USER_NOT_FOUND");
        }

        // Verify the entered password against the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          throw new ApolloError("Invalid password", "INVALID_PASSWORD");
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, "your-secret-key", {
          expiresIn: "1h",
        });

        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          password: user.password,
          token,
        };
      } catch (error) {
        throw new ApolloError(`Error ${error.message}`, "LOGIN_ERROR");
      }
    },
  },
};

module.exports = userResolver;
