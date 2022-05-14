const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../util/validators");
const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");
const checkAuth = require("../../util/check-auth");
const formatDate = require("../../util/formatDate");

const generateToken = (createdUser) => {
  return jwt.sign(
    {
      id: createdUser.id,
      email: createdUser.email,
      username: createdUser.username,
    },
    SECRET_KEY,
    { expiresIn: "24h" }
  );
};

module.exports = {
  Query: {
    me: async (_, args, context) => {
      const user = checkAuth(context);

      try {
        const thatUser = await User.findById(user.id);

        return {
          ...thatUser._doc,
          createdAt: formatDate(thatUser._doc.createdAt),
        };
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutaion: {
    login: async (_, args) => {
      const { username, password } = args;
      const { valid, errors } = validateLoginInput(username, password);
      if (!valid) {
        throw new UserInputError("Error", { errors });
      }
      const user = await User.findOne({ username });
      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("Yser not Found", { errors });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        errors.general = "Wrong Credentials";
        throw new UserInputError("Wrong Credentials", { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        token,
      };
    },
    register: async (_, args) => {
      const { registerInput } = args;
      const { email, password, confirmPassword, username } = registerInput;
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Error", { errors });
      }
      try {
        const user = await User.findOne({ username });

        if (user) {
          throw new UserInputError("username Aleady taken", {
            errors: {
              username: "This username is Taken",
            },
          });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
          email,
          password: hashedPassword,
          username,
        });
        let createdUser = await newUser.save();

        const token = generateToken(createdUser);

        return {
          ...createdUser._doc,
          token,
        };
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};
