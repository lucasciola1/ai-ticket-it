import styled from '@emotion/native';
import { useNavigation } from '@react-navigation/native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import { useTheme } from '@emotion/react';
import { Boton } from './Boton';
import { Subtitulo, TextoSecundario } from './Textos';

const Centro = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.espacio.xl}px;
  gap: ${({ theme }) => theme.espacio.m}px;
  background-color: ${({ theme }) => theme.colores.fondo};
`;

const Botones = styled.View`
  align-self: stretch;
  gap: ${({ theme }) => theme.espacio.s}px;
  margin-top: ${({ theme }) => theme.espacio.m}px;
`;

const Centrado = styled(TextoSecundario)`
  text-align: center;
`;

/** Lo que ve en una pestaña privada alguien que todavía no inició sesión. */
export function RequiereSesion({ titulo, mensaje, icono = 'account-lock-outline' }) {
  const navigation = useNavigation();
  const theme = useTheme();
  return (
    <Centro>
      <MaterialDesignIcons name={icono} size={56} color={theme.colores.primario} />
      <Subtitulo>{titulo}</Subtitulo>
      <Centrado>{mensaje}</Centrado>
      <Botones>
        <Boton titulo="Iniciar sesión" onPress={() => navigation.navigate('Login')} />
        <Boton titulo="Crear cuenta" variante="secundario" onPress={() => navigation.navigate('Registro')} />
      </Botones>
    </Centro>
  );
}
