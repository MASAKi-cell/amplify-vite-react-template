import { defineAuth } from "@aws-amplify/backend";

/**
 * 認証する方法を定義
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});
