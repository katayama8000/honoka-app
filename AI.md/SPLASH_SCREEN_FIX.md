# スプラッシュ画面の設定について

## 問題
スプラッシュ画像が画面いっぱいに広がらない問題がありました。

## 原因
`app.config.ts`のスプラッシュ設定で`resizeMode: "contain"`が設定されていたため、画像が画面に収まるようにリサイズされ、余白が生じていました。

## 解決方法

### Before（問題のある設定）
```typescript
splash: {
  image: "./assets/images/splash_cat.png",
  resizeMode: "contain",  // ← これが原因
  backgroundColor: "#336666",
},
```

### After（修正後の設定）
```typescript
splash: {
  image: "./assets/images/splash_cat.png",
  resizeMode: "cover",    // ← 画面いっぱいに表示
  backgroundColor: "#336666",
},
```

## resizeModeの種類

### contain
- 画像のアスペクト比を保持しながら画面に収める
- 画像全体が表示されるが、余白が生じる可能性がある

### cover 
- 画像のアスペクト比を保持しながら画面いっぱいに表示
- 画像の一部がクロップされる可能性があるが、余白は生じない

### native
- 画像の元のサイズで表示（推奨されません）

## プラットフォーム別設定

修正後の設定では、各プラットフォームに適切なスプラッシュ設定を追加しました：

### グローバル設定
```typescript
splash: {
  image: "./assets/images/splash_cat.png",
  resizeMode: "cover",
  backgroundColor: "#336666",
},
```

### iOS設定
```typescript
ios: {
  supportsTablet: true,
  bundleIdentifier: bundleId,
  splash: {
    image: "./assets/images/splash_cat.png",
    resizeMode: "cover",
    backgroundColor: "#336666",
  },
},
```

### Android設定
```typescript
android: {
  adaptiveIcon: {
    foregroundImage: "./assets/images/moufu_n_ikura.png", // アイコン用画像に変更
    backgroundColor: "#336666",
  },
  splash: {
    image: "./assets/images/splash_cat.png",
    resizeMode: "cover",
    backgroundColor: "#336666",
  },
  package: packageName,
  googleServicesFile: googleServicesJson,
},
```

## 注意点

1. **画像のアスペクト比**: `cover`を使用する場合、様々な画面サイズに対応できるよう、重要な要素は画像の中央に配置することを推奨します。

2. **背景色**: 画像の読み込みが遅い場合や、画像のクロップされた部分に背景色が表示されるため、適切な背景色を設定することが重要です。

3. **ビルド後の確認**: 設定変更後は実際のデバイスでスプラッシュ画面を確認することを推奨します。

## 反映方法

設定変更後、以下のコマンドでアプリを再ビルドしてください：

```bash
# iOS
yarn ios

# Android  
yarn android

# 本番ビルド
eas build --platform all
```
