export const config = {
  appName: "DigitalMemoryBook",
  logLevel: "debug",
  staticBase: "/frontend/",

  auth: {
    minPasswordLength: 6,
    maxUsernameLength: 24,
    maxProfileIntroLength: 600,
  },

  memories: {
    maxTitleLength: 120,
    maxBodyLength: 8000,
    maxTags: 12,
    maxTagLength: 32,
    maxPhotos: 8,
    maxPhotoBytes: 5 * 1024 * 1024,
    allowedPhotoMimes: ["image/jpeg", "image/png", "image/webp"],
  },

  messages: {
    maxContentLength: 2000,
    maxIntroLength: 400,
  },
};
