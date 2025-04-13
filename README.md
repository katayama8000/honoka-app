# Honoka App
A dedicated money management app for my wife Honoka and our cats Moufu and Ikura.
The previous app name was HouseHold Account Book.
There are still some parts of the code that contain "HouseHold Account Book", but I haven't renamed them yet because it's too much of a hassle.

## Overview
HouseHold Account Book is a personal finance app designed to help manage and track expenses. This app is specifically tailored for use by my wife Honoka and our beloved cats, Moufu and Ikura.

## Tech Stack
- Frontend
    - React Native
    - Expo
- Backend
    - Firebase (FCM)
    - Supabase (Auth, Database)
    - Vercel (Serverless Functions)
        - https://github.com/katayama8000/expo-push-notification-api-rust
- CI/CD
    - GitHub Actions

## Setup and Run
Copy the `.env.dist` file to `.env` and set the environment variables.
```bash
cp .env.example .env
```
Then, run the following command to start the app.
```bash
yarn i
yarn dev
```
