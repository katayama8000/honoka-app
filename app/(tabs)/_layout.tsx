import { Tabs } from "expo-router";
import { useAtom } from "jotai";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
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
        name="subscriptions"
        options={{
          title: "サブスク",
          headerTitleStyle: {
            fontSize: 22,
            color: Colors.white,
          },
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? "card" : "card-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="compare-prices"
        options={{
          title: "価格比較",
          headerTitleStyle: {
            fontSize: 22,
            color: Colors.white,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "calculator" : "calculator-outline"} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
