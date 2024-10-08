import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "../../../../../lib/mongodb";
import User from "../../../../../models/user";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        const { name } = credentials;

        try {
          await connectMongoDB();
          const user = await User.findOne({ name });

          if (!user) {
            return null;
          }

          return {
            id: user._id,
            name: user.name,
            role: user.role,
            user_type: user.user_type, 
          };
        } catch (error) {
          console.log("Error: ", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // หน้าเข้าสู่ระบบ
    signOut: "/login", // หน้าออกจากระบบ
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          user_type: user.user_type,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          user_type: token.user_type,
        },
      };
    },
    async redirect({ url, baseUrl }) {
      if (url === '/api/auth/signout') {
        return baseUrl; // เปลี่ยนเส้นทางหลังการล็อกเอ้าท์
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
