import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Colors } from "@/constants/Colors";

interface Product {
  id: "A" | "B";
  name: string;
  price: string;
  volume: string;
}

type CheaperStatus = "A" | "B" | "SAME" | null;

interface ComparisonResult {
  unitPriceA: number | null;
  unitPriceB: number | null;
  cheaperProduct: CheaperStatus;
}

// --- カスタムフック (Hooks) ---

/**
 * キーボードの表示状態を管理するフック
 */
const useKeyboardVisibility = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return isKeyboardVisible;
};

const usePriceComparison = (products: Product[]): ComparisonResult => {
  return useMemo(() => {
    const [productA, productB] = products;
    const priceA = parseFloat(productA.price);
    const volumeA = parseFloat(productA.volume);
    const priceB = parseFloat(productB.price);
    const volumeB = parseFloat(productB.volume);

    const areInputsValid = volumeA > 0 && volumeB > 0 && !Number.isNaN(priceA) && !Number.isNaN(priceB);

    if (!areInputsValid) {
      return { unitPriceA: null, unitPriceB: null, cheaperProduct: null };
    }

    const unitA = priceA / volumeA;
    const unitB = priceB / volumeB;
    let cheaper: CheaperStatus = null;

    if (unitA < unitB) cheaper = "A";
    else if (unitB < unitA) cheaper = "B";
    else if (unitA === unitB) cheaper = "SAME";

    return { unitPriceA: unitA, unitPriceB: unitB, cheaperProduct: cheaper };
  }, [products]);
};

const InputTable: React.FC<{
  products: Product[];
  onProductChange: (id: Product["id"], field: "price" | "volume", value: string) => void;
}> = ({ products, onProductChange }) => (
  <View style={styles.card}>
    <View style={styles.inputRow}>
      <View style={styles.labelColumn} />
      {products.map((p) => (
        <View key={p.id} style={styles.inputColumn}>
          <Text style={styles.productTitle}>{p.name}</Text>
        </View>
      ))}
    </View>
    <View style={styles.inputRow}>
      <View style={styles.labelColumn}>
        <Text style={styles.label}>価格 (円)</Text>
      </View>
      {products.map((p) => (
        <View key={p.id} style={styles.inputColumn}>
          <TextInput
            style={styles.input}
            value={p.price}
            onChangeText={(text) => onProductChange(p.id, "price", text.replace(/[^0-9.]/g, ""))}
            keyboardType="numeric"
            placeholder="例: 300"
          />
        </View>
      ))}
    </View>
    <View style={styles.inputRow}>
      <View style={styles.labelColumn}>
        <Text style={styles.label}>容量・数量</Text>
      </View>
      {products.map((p) => (
        <View key={p.id} style={styles.inputColumn}>
          <TextInput
            style={styles.input}
            value={p.volume}
            onChangeText={(text) => onProductChange(p.id, "volume", text.replace(/[^0-9.]/g, ""))}
            keyboardType="numeric"
            placeholder="例: 500"
          />
        </View>
      ))}
    </View>
  </View>
);

const ResultDisplay: React.FC<{ result: ComparisonResult }> = ({ result }) => {
  const { unitPriceA, unitPriceB, cheaperProduct } = result;

  if (cheaperProduct === null) {
    return <Text style={styles.placeholderText}>数値を入力して比較してください。</Text>;
  }

  const getSummaryText = () => {
    switch (cheaperProduct) {
      case "A":
        return "商品Aの方がお得です！🎉";
      case "B":
        return "商品Bの方がお得です！🎉";
      case "SAME":
        return "両方とも同じ価格です。";
      default:
        return null;
    }
  };

  const resultStyleA = cheaperProduct === "A" || cheaperProduct === "SAME" ? styles.cheaper : styles.expensive;
  const resultStyleB = cheaperProduct === "B" || cheaperProduct === "SAME" ? styles.cheaper : styles.expensive;

  return (
    <View style={styles.resultContainer}>
      <Text style={styles.resultTitle}>比較結果</Text>
      <View style={styles.resultDetails}>
        <View style={[styles.resultCard, resultStyleA]}>
          <Text style={styles.resultProductTitle}>商品A</Text>
          <Text style={styles.unitPriceText}>{unitPriceA?.toFixed(2)} 円/単位</Text>
        </View>
        <View style={[styles.resultCard, resultStyleB]}>
          <Text style={styles.resultProductTitle}>商品B</Text>
          <Text style={styles.unitPriceText}>{unitPriceB?.toFixed(2)} 円/単位</Text>
        </View>
      </View>
      <Text style={styles.summaryText}>{getSummaryText()}</Text>
    </View>
  );
};

const INITIAL_PRODUCTS: Product[] = [
  { id: "A", name: "商品A", price: "", volume: "" },
  { id: "B", name: "商品B", price: "", volume: "" },
];

export default function ComparePrices() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const isKeyboardVisible = useKeyboardVisibility();
  const comparisonResult = usePriceComparison(products);

  const handleProductChange = (id: Product["id"], field: "price" | "volume", value: string) => {
    setProducts((currentProducts) => currentProducts.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingView}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <Text style={styles.title}>価格比較ツール ⚖️</Text>
            <InputTable products={products} onProductChange={handleProductChange} />
            {!isKeyboardVisible && <ResultDisplay result={comparisonResult} />}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1 },
  container: {
    padding: 16,
    backgroundColor: Colors.gray,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: Colors.primary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  labelColumn: {
    flex: 0.8, // ラベル列の幅を調整
  },
  inputColumn: {
    flex: 1,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    paddingHorizontal: 8,
    fontSize: 16,
    backgroundColor: Colors.gray,
    borderRadius: 4,
    textAlign: "center",
  },
  placeholderText: {
    textAlign: "center",
    color: Colors.light.text,
    fontStyle: "italic",
    paddingVertical: 30,
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 16,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: Colors.primary,
  },
  resultDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  resultCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  resultProductTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.white,
  },
  unitPriceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.white,
    marginTop: 4,
  },
  cheaper: {
    backgroundColor: Colors.primary,
  },
  expensive: {
    backgroundColor: "#a9a9a9",
  },
  summaryText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.secondary,
    marginTop: 8,
  },
});
