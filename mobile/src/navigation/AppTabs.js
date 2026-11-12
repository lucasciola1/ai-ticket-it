import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@emotion/react';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import { MisEventosScreen } from '../screens/PantallasPendientes';
import { MisComprasScreen } from '../screens/compras/MisComprasScreen';
import { ExplorarScreen } from '../screens/eventos/ExplorarScreen';
import { PerfilScreen } from '../screens/perfil/PerfilScreen';

const Tab = createBottomTabNavigator();

const ICONOS = {
  Explorar: 'magnify',
  MisCompras: 'ticket-confirmation-outline',
  MisEventos: 'calendar-star',
  Perfil: 'account-circle-outline',
};

// Definido fuera del componente para no recrear el ícono en cada render
const iconoDe =
  (nombreRuta) =>
  ({ color, size }) => <MaterialDesignIcons name={ICONOS[nombreRuta]} color={color} size={size} />;

export function AppTabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: iconoDe(route.name),
        tabBarActiveTintColor: theme.colores.primario,
        tabBarInactiveTintColor: theme.colores.textoSecundario,
        headerTitleStyle: { fontWeight: '700' },
      })}
    >
      <Tab.Screen name="Explorar" component={ExplorarScreen} />
      <Tab.Screen name="MisCompras" component={MisComprasScreen} options={{ title: 'Mis compras' }} />
      <Tab.Screen name="MisEventos" component={MisEventosScreen} options={{ title: 'Mis eventos' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
