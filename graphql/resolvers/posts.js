const Post = require("../../models/Post");

const checkAuth = require("../../util/check-auth");
const formatDate = require("../../util/formatDate");

module.exports = {
  Query: {
    getPosts: async (_, args) => {
      try {
        const posts = await Post.find()
          .skip(args.page * 10)
          .limit(10)
          .sort({ createdAt: -1 });

        const postsCount = await Post.countDocuments();

        let newPosts = posts.map((post) => {
          return {
            ...post._doc,
            createdAt: formatDate(post._doc.createdAt),
            updateddAt: formatDate(post._doc.updateddAt),
          };
        });

        return {
          count: postsCount,
          nodes: newPosts,
        };
      } catch (error) {
        throw new Error(error);
      }
    },

    getPost: async (_, args) => {
      const { postId } = args;
      try {
        const post = await Post.findById(postId);
        if (!post) {
          throw new Error("Oppps post was not found");
        }
        return {
          ...post._doc,
          createdAt: formatDate(post._doc.createdAt),
          updateddAt: formatDate(post._doc.updateddAt),
        };
      } catch (error) {
        throw new Error(error);
      }
    },
  },

  Mutation: {
    createPost: async (_, args, context) => {
      const user = checkAuth(context);
      try {
        const post = new Post({
          body: args.body,
          username: user.username,
          comments: [],
          likes: [],
          user: user.id,
        });

        let result = await post.save();
        return {
          ...result._doc,
          createdAt: formatDate(result._doc.createdAt),
          updatedAt: formatDate(result._doc.updatedAt),
        };
      } catch (error) {
        throw new Error(error);
      }
    },
    deletePost: async (_, args, context) => {
      const { postId } = args;
      const user = checkAuth(context);
      try {
        const post = await Post.findById(postId);
        if (post.user.toString() !== user.id.toString()) {
          throw new Error("this user isn't the owner of this post");
        }
        const result = await Post.findByIdAndRemove(postId);
        console.log(result);
        return result;
      } catch (error) {
        throw new Error(error);
      }
    },
    likePost: async (_, args, context) => {
      const { postId } = args;
      const user = checkAuth(context);
      try {
        const post = await Post.findById(postId);

        if (!post) {
          throw new UserInputError("Post not found");
        }

        if (post.likes.find((like) => like.username === user.username)) {
          post.likes = post.likes.filter(
            (like) => like.username !== user.username
          );
        } else {
          post.likes.unshift({
            username: user.username,
            createdAt: new Date().toISOString(),
          });
        }
        await post.save();
        return {
          ...post._doc,
          createdAt: formatDate(post._doc.createdAt),
          updatedAt: formatDate(post._doc.updatedAt),
        };
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};
