# Nebula

> A Vercel-ready chat and media application built with Next.js.

Nebula lets users create servers, manage channels, chat in text channels, and join LiveKit-powered media rooms.

## Installing / Getting started

A quick introduction of the minimal setup you need to get the project up and running.

First, you'll need Node.js 20.9+ and npm installed. You will also need a Postgres database. Prisma is used for persistence, Clerk handles auth, UploadThing handles uploads, and LiveKit powers media rooms.

You will also need to create a `.env` file with the required environment variables. You can use `.env.example` as a template if one is available.

Below are the required environment variables:

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=
DIRECT_URL=

# UploadThing
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# LiveKit
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

```shell
# Clone the repository
git clone https://github.com/ReaganBlade/nebula.git

# Change directory
cd nebula

# Install dependencies
npm install

# Push the database schema
npx prisma db push

# Verify required environment variables
npm run env:check

# Run the production verification suite
npm run verify

# Run the development server
npm run dev
```

The application should now be running on [http://localhost:3000](http://localhost:3000).

## Features

* Vercel-safe text chat with polling-based updates
* LiveKit SFU media rooms for video and audio transport
* User authentication with Clerk
* File uploads with UploadThing
* Prisma-backed server, member, and channel management

## Deployment Notes

Deploy this project to Vercel with all variables from `.env.example` configured in the target environment.

Run `npm run env:check` before deployment. The command exits non-zero when required secrets are missing.

## Contributing

If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## Links

- Repository: [https://github.com/ReaganBlade/nebula](https://github.com/ReaganBlade/nebula)
- Issue tracker: [https://github.com/ReaganBlade/nebula/issues](https://github.com/ReaganBlade/nebula/issues)

## Licensing

The code in this project is licensed under the MIT license.

