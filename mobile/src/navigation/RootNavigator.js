import { ActivityIndicator } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { AppTabs } from './AppTabs';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegistroScreen } from '../screens/auth/RegistroScreen';
import { DetalleEventoScreen } from '../screens/eventos/DetalleEventoScreen';
import { ComprarScreen } from '../screens/compras/ComprarScreen';
import { DetalleCompraScreen } from '../screens/compras/DetalleCompraScreen';
import { ChatScreen } from '../screens/compras/ChatScreen';
import { ReseniarScreen } from '../screens/compras/ReseniarScreen';
import { CrearEventoScreen } from '../screens/organizador/CrearEventoScreen';
import { ComprasDelEventoScreen } from '../screens/organizador/ComprasDelEventoScreen';

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
      <Stack.Screen name="DetalleEvento" component={DetalleEventoScreen} options={{ title: 'Evento' }} />
      <Stack.Screen name="DetalleCompra" component={DetalleCompraScreen} options={{ title: 'Compra' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Mensajes' }} />
      <Stack.Screen name="CrearEvento" component={CrearEventoScreen} options={{ title: 'Nuevo evento' }} />
      <Stack.Screen name="ComprasDelEvento" component={ComprasDelEventoScreen} options={{ title: 'Ventas' }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Comprar" component={ComprarScreen} options={{ title: 'Comprar entradas' }} />
        <Stack.Screen name="Reseniar" component={ReseniarScreen} options={{ title: 'Calificar evento' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name="Registro" component={RegistroScreen} options={{ title: 'Crear cuenta' }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
