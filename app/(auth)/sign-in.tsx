import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/auth";
import { usePushNotification } from "@/hooks/usePushNotification";
import { defaultFontSize, defaultFontWeight } from "@/style/defaultStyle";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

const SignInScreen = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { setOptions } = useNavigation();
  const { push } = useRouter();
  const { signIn, isAuthenticated } = useAuth();
  const { registerForPushNotificationsAsync } = usePushNotification();

  useEffect(() => {
    setOptions({
      headerShown: false,
    });
  }, [setOptions]);

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      push("/");
    }
  }, [isAuthenticated, push]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const { success, error } = await signIn(email, password);

      if (!success) {
        throw new Error(error?.message || "ログインに失敗しました");
      }

      // Register for push notifications
      const token = await registerForPushNotificationsAsync();
      
      ToastAndroid.show("ログインしました", ToastAndroid.SHORT);
      push({ pathname: "/" });
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("不明なエラーが発生しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>もうふといくら</Text>
        <View style={[styles.inputContainer, styles.mt20]}>
          <TextInput
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="example@gmail.com"
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={!showPassword}
            placeholder="Password"
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#aaa" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.buttonContainer, styles.mt20]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>ログイン</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: defaultFontWeight,
    textAlign: "center",
    marginBottom: 20,
    color: Colors.primary,
  },
  inputContainer: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  buttonContainer: {
    borderRadius: 8,
    backgroundColor: Colors.primary,
    padding: 15,
    alignItems: "center",
  },
  buttonText: {
    fontSize: defaultFontSize,
    fontWeight: defaultFontWeight,
    color: "white",
  },
  mt20: {
    marginTop: 20,
  },
});

export default SignInScreen;
