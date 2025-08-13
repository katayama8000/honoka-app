import { useState } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";
import { supabase } from "@/lib/supabase";

const HelloWorldComponent = () => {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const callHelloWorld = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc("hello-world");
      if (error) {
        setError(error.message);
        return;
      }
      setResult(data);
    } catch (err) {
      console.error("Error calling hello-world RPC:", err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Call Hello World" onPress={callHelloWorld} disabled={loading} />
      {loading && <ActivityIndicator size="large" />}
      {result && <Text style={{ marginTop: 10, color: "green" }}>Result: {result}</Text>}
      {error && <Text style={{ marginTop: 10, color: "red" }}>Error: {error}</Text>}
    </View>
  );
};

export default HelloWorldComponent;
