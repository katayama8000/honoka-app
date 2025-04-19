import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { Tabs } from "expo-router";
import { useAtom } from "jotai";
import { activeInvoiceAtom } from "../../state/invoice.state";

export default function TabLayout() {
  const [activeInvoice] = useAtom(activeInvoiceAtom);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.primary,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: activeInvoice === null ? "...loading" : `${activeInvoice?.month}月`,
          headerTitleStyle: {
            fontSize: 22,
            color: Colors.white,
          },
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? "today" : "today-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="past-invoices"
        options={{
          title: "過去",
          headerTitleStyle: {
            fontSize: 22,
            color: Colors.white,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "calendar-number" : "calendar-number-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="qr-code"
        options={{
          title: "QRコード",
          headerTitleStyle: {
            fontSize: 22,
            color: Colors.white,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "qr-code" : "qr-code-outline"} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
