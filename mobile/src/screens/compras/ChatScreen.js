import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import { useAuth } from '../../context/AuthContext';
import { useCarga } from '../../hooks/useCarga';
import { usePolling } from '../../hooks/usePolling';
import { enviarMensaje, obtenerMensajes } from '../../services/compraService';
import { mensajeError } from '../../services/api';
import { EstadoCarga } from '../../components/EstadoCarga';
import { Pantalla, TextoError } from '../../components/Textos';

const CADA_MS = 4000;

const Burbuja = styled.View`
  max-width: 80%;
  padding: ${({ theme }) => `${theme.espacio.s}px ${theme.espacio.m}px`};
  margin-bottom: ${({ theme }) => `${theme.espacio.s}px`};
  gap: 2px;
  border-radius: ${({ theme }) => `${theme.radio.m}px`};
  align-self: ${({ propio }) => (propio ? 'flex-end' : 'flex-start')};
  background-color: ${({ theme, propio }) => (propio ? theme.colores.primario : theme.colores.superficie)};
`;

const Autor = styled.Text`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colores.primario};
`;

const TextoMensaje = styled.Text`
  font-size: ${({ theme }) => `${theme.fuente.normal}px`};
  color: ${({ theme, propio }) => (propio ? theme.colores.blanco : theme.colores.texto)};
`;

const Hora = styled.Text`
  align-self: flex-end;
  font-size: 11px;
  color: ${({ theme, propio }) => (propio ? theme.colores.primarioSuave : theme.colores.textoSecundario)};
`;

const Redactor = styled.View`
  flex-direction: row;
  align-items: flex-end;
  gap: ${({ theme }) => `${theme.espacio.s}px`};
  padding: ${({ theme }) => `${theme.espacio.s}px ${theme.espacio.m}px`};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colores.borde};
  background-color: ${({ theme }) => theme.colores.superficie};
`;

const Input = styled.TextInput`
  flex: 1;
  max-height: 120px;
  min-height: 44px;
  padding: 10px 14px;
  border-radius: 22px;
  font-size: ${({ theme }) => `${theme.fuente.normal}px`};
  color: ${({ theme }) => theme.colores.texto};
  background-color: ${({ theme }) => theme.colores.fondo};
`;

const BotonEnviar = styled(Pressable)`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colores.primario};
  opacity: ${({ inactivo }) => (inactivo ? 0.4 : 1)};
`;

const Vacio = styled.Text`
  text-align: center;
  margin-top: ${({ theme }) => `${theme.espacio.xxl}px`};
  color: ${({ theme }) => theme.colores.textoSecundario};
`;

const ErrorEnvio = styled(TextoError)`
  padding: 0px 16px;
`;

const listaContenido = { padding: 16, flexGrow: 1 };

const hora = (fecha) =>
  `${fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} ${fecha.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

export function ChatScreen({ route, navigation }) {
  const { compraId, titulo } = route.params;
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { usuario } = useAuth();
  const lista = useRef(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);

  const { datos: mensajes, setDatos, cargando, error, recargar } = useCarga(() => obtenerMensajes(compraId), [compraId]);

  useEffect(() => {
    navigation.setOptions({ title: titulo ?? 'Mensajes' });
  }, [navigation, titulo]);

  // Consulta mensajes nuevos mientras el chat está abierto. Si una consulta falla,
  // se ignora: se mantiene lo que ya se ve y se reintenta en la próxima.
  usePolling(async () => {
    try {
      setDatos(await obtenerMensajes(compraId));
    } catch {
      // sin conexión momentánea: no interrumpimos la conversación
    }
  }, CADA_MS);

  const enviar = async () => {
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const nuevo = await enviarMensaje(compraId, limpio);
      setDatos((actuales) => [...(actuales ?? []), nuevo]);
      setTexto('');
    } catch (err) {
      setErrorEnvio(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Pantalla>
      <EstadoCarga cargando={cargando && !mensajes} error={error} onReintentar={recargar}>
        <FlatList
          ref={lista}
          data={mensajes ?? []}
          keyExtractor={(m) => m.id}
          contentContainerStyle={listaContenido}
          onContentSizeChange={() => lista.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={<Vacio>Escribí tu consulta sobre el evento, el acceso o cambios de fecha.</Vacio>}
          renderItem={({ item }) => {
            const propio = item.autor?.id === usuario?.id;
            return (
              <Burbuja propio={propio}>
                {!propio ? (
                  <Autor>
                    {`${item.autor?.nombre ?? ''} ${item.autor?.apellido ?? ''}${item.esDelOrganizador ? ' · Organizador' : ''}`}
                  </Autor>
                ) : null}
                <TextoMensaje propio={propio}>{item.texto}</TextoMensaje>
                <Hora propio={propio}>{hora(item.enviado)}</Hora>
              </Burbuja>
            );
          }}
        />
      </EstadoCarga>

      {errorEnvio ? <ErrorEnvio>{errorEnvio}</ErrorEnvio> : null}
      <Redactor style={{ paddingBottom: Math.max(bottom, 8) }}>
        <Input
          value={texto}
          onChangeText={setTexto}
          placeholder="Escribí un mensaje…"
          placeholderTextColor={theme.colores.textoSecundario}
          multiline
          maxLength={1000}
          accessibilityLabel="Mensaje"
        />
        <BotonEnviar
          onPress={enviar}
          disabled={!texto.trim() || enviando}
          inactivo={!texto.trim() || enviando}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensaje"
        >
          {enviando ? (
            <ActivityIndicator color={theme.colores.blanco} />
          ) : (
            <MaterialDesignIcons name="send" size={20} color={theme.colores.blanco} />
          )}
        </BotonEnviar>
      </Redactor>
    </Pantalla>
  );
}
