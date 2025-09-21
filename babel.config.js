module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          unstable_transformImportMeta: true,
          jsxImportSource: "react",
        },
      ],
    ],
    plugins: ["react-native-worklets/plugin"],
  };
};
