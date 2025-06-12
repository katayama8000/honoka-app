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

### Check secret list
https://docs.expo.dev/build-reference/variables/
```bash
eas secret:list
```

### Over the air update
- update the app without building
```bash
eas update --channel production
```
