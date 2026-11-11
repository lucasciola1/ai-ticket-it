import { ActivityIndicator } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { AppTabs } from './AppTabs';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegistroScreen } from '../screens/auth/RegistroScreen';

const Stack = createNativeStackNavigator();

const Splash = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colores.fondo};
`;

/**
 * Las tabs son públicas (se puede explorar sin sesión).
 * Login y Registro son modales: al terminar vuelven a donde estaba el usuario.
 */
export function RootNavigator() {
  const { restaurando } = useAuth();
  const theme = useTheme();

  if (restaurando) {
    return (
      <Splash>
        <ActivityIndicator size="large" color={theme.colores.primario} />
      </Splash>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.colores.primario,
        headerTitleStyle: { color: theme.colores.texto, fontWeight: '700' },
        contentStyle: { backgroundColor: theme.colores.fondo },
      }}
    >
      <Stack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name="Registro" component={RegistroScreen} options={{ title: 'Crear cuenta' }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
