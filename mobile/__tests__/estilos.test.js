/* eslint-env jest */
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '@emotion/react';
import { render, screen } from '@testing-library/react-native';
import { theme } from '../src/theme/theme';
import { Boton } from '../src/components/Boton';
import { Formulario } from '../src/components/Formulario';

/*
 * Regresión: Emotion native descarta interpolaciones tipo `${valor}px`
 * (el padding o el radio desaparecían sin error). Las interpolaciones del
 * theme tienen que devolver el valor completo: `${`${theme.espacio.xl}px`}`.
 */
const conTheme = (ui) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

test('los espaciados del theme llegan como estilos', async () => {
  await conTheme(<Formulario testID="formulario" />);
  const estilo = StyleSheet.flatten(screen.getByTestId('formulario').props.style);
  expect(estilo.paddingTop).toBe(theme.espacio.xl);
  expect(estilo.gap).toBe(theme.espacio.s);
});

test('el botón tiene el radio de borde del theme', async () => {
  await conTheme(<Boton titulo="Comprar" onPress={() => {}} />);
  const estilo = StyleSheet.flatten(screen.getByRole('button').props.style);
  expect(estilo.borderTopLeftRadius).toBe(theme.radio.m);
});
