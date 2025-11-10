# react-native-swipeable-view

A React Native component for swipeable views with gesture support and customizable confirmation dialogs.

## Features

- 🚀 Smooth swipe gestures using react-native-reanimated
- ⚠️ Built-in confirmation dialog for destructive actions
- 🎨 Customizable appearance and behavior
- 📱 Works on both iOS and Android
- 💾 TypeScript support
- 🪶 Lightweight with minimal dependencies

## Installation

```bash
yarn add react-native-swipeable-view
```

### Peer Dependencies

Make sure you have the following packages installed:

```bash
yarn add react-native-gesture-handler react-native-reanimated
```

Follow the installation guides for:
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/installation)
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)

## Usage

### Basic Example

```tsx
import { SwiperView } from 'react-native-swipeable-view';
import { View, Text } from 'react-native';

const App = () => {
  return (
    <SwiperView
      onSwipeLeft={() => console.log('Item deleted')}
      backView={
        <View style={{ backgroundColor: 'red', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white' }}>Delete</Text>
        </View>
      }
    >
      <View style={{ padding: 20, backgroundColor: 'white' }}>
        <Text>Swipe left to delete this item</Text>
      </View>
    </SwiperView>
  );
};
```

### Advanced Example

```tsx
import { SwiperView } from 'react-native-swipeable-view';

const App = () => {
  return (
    <SwiperView
      onSwipeLeft={() => console.log('Custom deletion')}
      onPress={() => console.log('Item pressed')}
      swipeThreshold={-100}
      maxSwipeDistance={-150}
      confirmationTitle="Delete Item"
      confirmationMessage="Are you sure you want to delete this item?"
      confirmButtonText="Delete"
      cancelButtonText="Cancel"
      backgroundColor="#f0f0f0"
      backView={
        <View style={{ backgroundColor: '#ff4444', flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 20 }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>DELETE</Text>
        </View>
      }
    >
      <View style={{ padding: 20 }}>
        <Text>Custom swipeable item</Text>
      </View>
    </SwiperView>
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | The main content to display |
| `backView` | `ReactNode` | `undefined` | Content shown behind when swiping |
| `onPress` | `() => void` | `undefined` | Callback when the view is pressed |
| `onSwipeLeft` | `() => void` | `undefined` | Callback when swipe left action is confirmed |
| `style` | `ViewStyle` | `undefined` | Additional styles for the container |
| `swipeThreshold` | `number` | `screen width * -0.2` | Distance threshold to trigger swipe action |
| `maxSwipeDistance` | `number` | `-128` | Maximum distance the view can be swiped |
| `confirmationTitle` | `string` | `"削除します"` | Title for the confirmation dialog |
| `confirmationMessage` | `string` | `"よろしいですか？"` | Message for the confirmation dialog |
| `confirmButtonText` | `string` | `"はい"` | Text for the confirm button |
| `cancelButtonText` | `string` | `"いいえ"` | Text for the cancel button |
| `backgroundColor` | `string` | `"#FFFFFF"` | Background color of the main content |

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
