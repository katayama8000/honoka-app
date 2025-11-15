import type { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { defaultFontWeight, defaultShadowColor } from "@/style/defaultStyle";
import type { Payment } from "@/types/Row";

type PaymentCardProps = {
  payment: Payment;
  isOwner: boolean;
  ownerLabel?: string;
  partnerLabel?: string;
  showDate?: boolean;
  actionButtons?: React.ReactNode;
};

export const PaymentCard: FC<PaymentCardProps> = ({
  payment,
  isOwner,
  ownerLabel = "あなた",
  partnerLabel = "パートナー",
  showDate = false,
  actionButtons,
}) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.itemTitle}>{payment.item}</Text>
          {showDate && (
            <Text style={styles.dateText}>
              {new Date(payment.updated_at).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </Text>
          )}
          <Text style={styles.amountText}>{payment.amount.toLocaleString()}円</Text>
          {payment.memo && <Text style={styles.memoText}>{payment.memo}</Text>}
        </View>

        <View style={isOwner ? styles.ownerIndicator : styles.partnerIndicator}>
          <Text style={isOwner ? styles.ownerText : styles.partnerText}>{isOwner ? ownerLabel : partnerLabel}</Text>
        </View>

        {actionButtons && <View style={styles.actionButtons}>{actionButtons}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 8,
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
    position: "relative",
  },
  cardContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: defaultFontWeight,
    marginBottom: 8,
    color: Colors.light.text,
  },
  dateText: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: defaultFontWeight,
    color: Colors.primary,
    marginBottom: 4,
  },
  memoText: {
    fontSize: 14,
    color: Colors.light.icon,
    marginTop: 4,
  },
  ownerIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ownerText: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: defaultFontWeight,
  },
  partnerIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.light.icon,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  partnerText: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: defaultFontWeight,
  },
  actionButtons: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
});
