import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@emotion/react';
import { theme } from './src/theme/theme';
import { AuthProvider } from './src/context/AuthContext';
import { FavoritosProvider } from './src/context/FavoritosContext';
import { RootNavigator } from './src/navigation/RootNavigator';

const temaNavegacion = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colores.primario,
    background: theme.colores.fondo,
    card: theme.colores.superficie,
    text: theme.colores.texto,
    border: theme.colores.borde,
  },
};

/** Solo providers y navegación: la lógica vive en contextos, hooks y services. */
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <FavoritosProvider>
            <NavigationContainer theme={temaNavegacion}>
              <StatusBar barStyle="dark-content" />
              <RootNavigator />
            </NavigationContainer>
          </FavoritosProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
