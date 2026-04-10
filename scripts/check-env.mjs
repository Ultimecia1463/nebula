import "dotenv/config";

const requiredEnvVars = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "DATABASE_URL",
  "DIRECT_URL",
  "UPLOADTHING_SECRET",
  "UPLOADTHING_APP_ID",
  "LIVEKIT_URL",
  "LIVEKIT_API_KEY",
  "LIVEKIT_API_SECRET",
];

const missingEnvVars = requiredEnvVars.filter(
  (key) => !process.env[key] || !process.env[key].trim()
);

if (missingEnvVars.length > 0) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        missingEnvVars,
      },
      null,
      2
    )
  );
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify(
      {
        ok: true,
        checkedEnvVars: requiredEnvVars,
      },
      null,
      2
    )
  );
}
