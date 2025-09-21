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
import { defaultFontSize, defaultFontWeight, defaultShadowColor } from "@/style/defaultStyle";

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
            placeholderTextColor={Colors.light.icon}
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
            placeholderTextColor={Colors.light.icon}
          />
        </View>
      ))}
    </View>
  </View>
);

const ResultDisplay: React.FC<{ result: ComparisonResult }> = ({ result }) => {
  const { unitPriceA, unitPriceB, cheaperProduct } = result;

  const getSummaryText = () => {
    switch (cheaperProduct) {
      case "A":
        return "商品Aの方がお得です！🎉";
      case "B":
        return "商品Bの方がお得です！🎉";
      case "SAME":
        return "両方とも同じ価格です。";
      default:
        return "";
    }
  };

  const resultStyleA = cheaperProduct === "A" || cheaperProduct === "SAME" ? styles.cheaper : styles.expensive;
  const resultStyleB = cheaperProduct === "B" || cheaperProduct === "SAME" ? styles.cheaper : styles.expensive;

  return (
    <View style={styles.card}>
      <Text style={styles.resultTitle}>比較結果</Text>
      <View style={styles.resultDetails}>
        <View style={[styles.resultCard, resultStyleA]}>
          <Text style={styles.resultProductTitle}>商品A</Text>
          <Text style={styles.unitPriceText}>{unitPriceA ? `${unitPriceA.toFixed(2)} 円/単位` : "-"}</Text>
        </View>
        <View style={[styles.resultCard, resultStyleB]}>
          <Text style={styles.resultProductTitle}>商品B</Text>
          <Text style={styles.unitPriceText}>{unitPriceB ? `${unitPriceB.toFixed(2)} 円/単位` : "-"}</Text>
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
      style={{ flex: 1 }}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <InputTable products={products} onProductChange={handleProductChange} />
            {!isKeyboardVisible && <ResultDisplay result={comparisonResult} />}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.light.background,
    padding: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.light.card,
    shadowColor: defaultShadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
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
    flex: 0.8,
  },
  inputColumn: {
    flex: 1,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: defaultFontSize,
    color: Colors.light.text,
    fontWeight: defaultFontWeight,
  },
  input: {
    height: 44,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    textAlign: "center",
    borderWidth: 1,
    borderColor: Colors.light.icon,
    color: Colors.light.text,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: Colors.light.text,
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
    color: Colors.textOnPrimary,
  },
  unitPriceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textOnPrimary,
    marginTop: 4,
  },
  cheaper: {
    backgroundColor: Colors.primary,
  },
  expensive: {
    backgroundColor: Colors.light.icon,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.secondary,
    marginTop: 8,
  },
});
