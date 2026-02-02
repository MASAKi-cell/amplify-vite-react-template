import { defineStorage } from "@aws-amplify/backend";

// S3の定義
export const storage = defineStorage({
  name: "blogStorage",
  access: (allow) => ({
    "posts/{entity_id}/*": [
      allow.authenticated.to(["read", "write", "delete"]),
      allow.guest.to(["read"]),
    ],
  }),
});
