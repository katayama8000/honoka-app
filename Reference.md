## Supabase

### generate type
```bash
./generate_types.sh
```

### schema
- https://supabase-schema.vercel.app/

## Expo

## Login
- login to expo
```bash
npx expo login
```

### Config
- verify which configuration will be embedded
```bash
npx expo config --type public
```

### Build
- eas build
```bash
eas build --platform android --profile development --non-interactive --no-wait
```

## Local build
- build the app locally
```bash
eas build --local --platform android --profile development --local
```

### Check secret list
https://docs.expo.dev/build-reference/variables/
```bash
eas secret:list
```

### Over the air update
- update the app without building
https://docs.expo.dev/deploy/send-over-the-air-updates/
change EXPO_PUBLIC_APP_ENV=development in .env to EXPO_PUBLIC_APP_ENV=production
```bash
eas update --channel production
```

### Deploy to EAS Hosting
- deploy the app to EAS Hosting
https://docs.expo.dev/eas/hosting/get-started/
```bash
npx expo export --platform web
eas deploy 
eas deploy --production
eas workflow:run .eas/workflows/deploy-dev.yml
eas workflow:run .eas/workflows/deploy-prd.yml
```

## Regenerate Native Code
- regenerate the Android and iOS native code
```bash
npx expo prebuild --clean
```
