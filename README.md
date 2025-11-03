# Nebula

> A real-time chat application built with Next.js.

A real-time chat application that allows users to create servers, channels, and communicate in real-time.

## Installing / Getting started

A quick introduction of the minimal setup you need to get the project up and running.

First, you'll need to have Node.js and npm installed. You will also need a database. This project uses Prisma, which can be configured to work with various SQL databases.

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
```

```shell
# Clone the repository
git clone https://github.com/ReaganBlade/nebula.git

# Change directory
cd nebula

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push the database schema
npx prisma db push

# Run the development server
npm run dev
```

The application should now be running on [http://localhost:3000](http://localhost:3000).

## Features

* Real-time messaging 
* User authentication with Clerk
* File uploads with UploadThing
* Light and dark mode
* Server and channel creation

## Contributing

If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## Links

- Repository: [https://github.com/ReaganBlade/nebula](https://github.com/ReaganBlade/nebula)
- Issue tracker: [https://github.com/ReaganBlade/nebula/issues](https://github.com/ReaganBlade/nebula/issues)

## Licensing

The code in this project is licensed under the MIT license.

