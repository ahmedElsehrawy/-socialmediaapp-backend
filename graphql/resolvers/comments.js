const { UserInputError, AuthenticationError } = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Mutation: {
    createComment: async (_, args, context) => {
      const user = checkAuth(context);
      const { postId, body } = args;
      if (body.trim() === "") {
        throw UserInputError("Empty comment", {
          errors: {
            body: "Comment body must not empty",
          },
        });
      }

      const post = await Post.findById(postId);

      if (!post) {
        throw new UserInputError("Post not found");
      }

      post.comments.unshift({
        body,
        username: user.username,
        createdAt: new Date().toISOString(),
      });
      await post.save();
      return post;
    },
    deleteComment: async (_, args, context) => {
      const { postId, commentId } = args;

      const user = checkAuth(context);

      const post = await Post.findById(postId);

      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);
        if (post.comments[commentIndex].username === user.username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } else {
        throw new UserInputError("post not found");
      }
    },
  },
};
