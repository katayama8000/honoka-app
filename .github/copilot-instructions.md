# Honoka App Development Guidelines

This document outlines the coding standards and best practices for the Honoka App project.

## Platform Support

- **This app supports Android only**
  - iOS implementations are not required
  - Focus on Android-specific features and optimizations
  - When implementing platform-specific code, prioritize Android

## JavaScript/TypeScript Guidelines

### Type System
- **Do not use enum**
  ```typescript
  // ❌ Avoid
  enum Status {
    Active,
    Inactive
  }
  
  // ✅ Instead use union types
  type Status = 'active' | 'inactive';
  ```

- **Do not use interface, use type instead**
  ```typescript
  // ❌ Avoid
  interface User {
    id: string;
    name: string;
  }
  
  // ✅ Instead use type
  type User = {
    id: string;
    name: string;
  };
  ```

- **Do not use class**
  ```typescript
  // ❌ Avoid
  class UserService {
    getUser() { /* ... */ }
  }
  
  // ✅ Instead use functions
  const getUserService = () => {
    const getUser = () => { /* ... */ };
    return { getUser };
  };
  ```

### Code Style
- **Do not use default export when it is not necessary**
  ```typescript
  // ❌ Avoid unnecessary default exports
  const Component = () => { /* ... */ };
  export default Component;
  
  // ✅ Instead use named exports
  export const Component = () => { /* ... */ };
  ```

- **Use arrow functions**
  ```typescript
  // ❌ Avoid
  function add(a, b) {
    return a + b;
  }
  
  // ✅ Instead use
  const add = (a, b) => {
    return a + b;
  };
  ```

- **Use async/await**
  ```typescript
  // ❌ Avoid
  const fetchData = () => {
    return fetch('/api/data')
      .then(res => res.json())
      .then(data => console.log(data));
  };
  
  // ✅ Instead use
  const fetchData = async () => {
    const res = await fetch('/api/data');
    const data = await res.json();
    console.log(data);
  };
  ```

- **Use const instead of let**
  ```typescript
  // ❌ Avoid when value won't change
  let value = 5;
  
  // ✅ Instead use
  const value = 5;
  ```

## React Guidelines

- **Use FC (FunctionComponent) type**
  ```typescript
  import { FC } from 'react';
  
  type Props = {
    title: string;
  };
  
  export const Component: FC<Props> = ({ title }) => {
    return <h1>{title}</h1>;
  };
  ```

- **Use functional components**
  ```typescript
  // ❌ Avoid
  class Button extends React.Component {
    render() {
      return <button>{this.props.label}</button>;
    }
  }
  
  // ✅ Instead use
  const Button = ({ label }) => {
    return <button>{label}</button>;
  };
  ```

- **Use React hooks**
  ```typescript
  // ❌ Avoid class component lifecycle methods
  
  // ✅ Instead use hooks
  const Component = () => {
    useEffect(() => {
      // Similar to componentDidMount
    }, []);
    
    const [count, setCount] = useState(0);
    // ...
  };
  ```

- **Define type for useState**
  ```typescript
  // ❌ Avoid implicit typing
  const [user, setUser] = useState();
  
  // ✅ Instead define explicit types
  type User = {
    id: string;
    name: string;
  };
  
  const [user, setUser] = useState<User | null>(null);
  ```

## Project Setup

- **Use yarn for package manager**
  ```bash
  # Installing dependencies
  yarn install
  
  # Adding a new package
  yarn add package-name
  
  # Adding a dev dependency
  yarn add -D package-name
  ```

## 2025/06/20
- Use Day.js insatead of new Date()
  ```typescript
  // ❌ Avoid
  const now = new Date();

  // ✅ Instead use Day.js
  import dayjs from 'dayjs';
  const now = dayjs();
  ```
