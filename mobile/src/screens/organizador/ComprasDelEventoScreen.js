import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { useCarga } from '../../hooks/useCarga';
import { useRecargarAlVolver } from '../../hooks/useRecargarAlVolver';
import { obtenerComprasDelEvento } from '../../services/compraService';
import { Boton } from '../../components/Boton';
import { Chip } from '../../components/Chip';
import { CompraCard } from '../../components/CompraCard';
import { EstadoCarga } from '../../components/EstadoCarga';
import { Pantalla, Subtitulo, Texto, TextoSecundario, Titulo } from '../../components/Textos';
import { formatearFecha, formatearPrecio } from '../../utils/formato';

const ESTADOS = ['PENDIENTE', 'CONFIRMADA', 'UTILIZADA', 'CANCELADA', 'REEMBOLSADA'];

const Encabezado = styled.View`
  gap: ${({ theme }) => `${theme.espacio.m}px`};
  margin-bottom: ${({ theme }) => `${theme.espacio.m}px`};
`;

const Tarjeta = styled.View`
  padding: ${({ theme }) => `${theme.espacio.m}px`};
  gap: 6px;
  border-radius: ${({ theme }) => `${theme.radio.m}px`};
  background-color: ${({ theme }) => theme.colores.superficie};
`;

const Fila = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Barra = styled.View`
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colores.borde};
`;

const Relleno = styled.View`
  height: 100%;
  width: ${({ porcentaje }) => `${porcentaje}%`};
  background-color: ${({ theme, agotado }) => (agotado ? theme.colores.error : theme.colores.primario)};
`;

const Negrita = styled(Texto)`
  font-weight: 700;
`;

const chipsContenido = { gap: 8 };
const listaContenido = { padding: 16, flexGrow: 1 };

/** Cupo vendido de un tipo de entrada, con barra de progreso. */
function Disponibilidad({ tipo }) {
  const porcentaje = tipo.cupo ? Math.round((tipo.vendidas / tipo.cupo) * 100) : 0;
  return (
    <Tarjeta>
      <Fila>
        <Negrita>{tipo.nombre}</Negrita>
        <TextoSecundario>{formatearPrecio(tipo.precio)}</TextoSecundario>
      </Fila>
      <Barra>
        <Relleno porcentaje={porcentaje} agotado={tipo.agotado} />
      </Barra>
      <Fila>
        <TextoSecundario>{`${tipo.vendidas} de ${tipo.cupo} vendidas`}</TextoSecundario>
        <Negrita>{tipo.agotado ? 'Agotado' : `Quedan ${tipo.disponibles}`}</Negrita>
      </Fila>
    </Tarjeta>
  );
}

export function ComprasDelEventoScreen({ route, navigation }) {
  const { eventoId } = route.params;
  const theme = useTheme();
  const [estado, setEstado] = useState(null);

  // El filtro por estado lo resuelve el back (?estado=); el resumen siempre cuenta todas
  const { datos, cargando, refrescando, error, recargar, refrescar } = useCarga(
    () => obtenerComprasDelEvento(eventoId, estado ?? undefined),
    [eventoId, estado],
  );
  useRecargarAlVolver(refrescar); // ej. al volver de validar una entrada

  const total = datos ? Object.values(datos.resumenPorEstado).reduce((a, b) => a + b, 0) : 0;

  const encabezado = datos ? (
    <Encabezado>
      <Titulo>{datos.evento.nombre}</Titulo>
      <TextoSecundario>{`${formatearFecha(datos.evento.fecha)} · ${datos.evento.lugar}`}</TextoSecundario>
      <Boton
        titulo="Ver publicación"
        variante="secundario"
        onPress={() => navigation.navigate('DetalleEvento', { eventoId })}
      />

      <Subtitulo>Entradas disponibles</Subtitulo>
      {datos.tiposEntrada.map((tipo) => (
        <Disponibilidad key={tipo.id} tipo={tipo} />
      ))}

      <Subtitulo>Compras</Subtitulo>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={chipsContenido}>
        <Chip etiqueta={`Todas · ${total}`} seleccionado={estado === null} onPress={() => setEstado(null)} />
        {ESTADOS.map((e) => (
          <Chip
            key={e}
            etiqueta={`${theme.estados[e].etiqueta} · ${datos.resumenPorEstado[e]}`}
            seleccionado={estado === e}
            onPress={() => setEstado(estado === e ? null : e)}
          />
        ))}
      </ScrollView>
    </Encabezado>
  ) : null;

  return (
    <Pantalla>
      {/* Mientras cambia el filtro se sigue viendo lo anterior: solo la primera carga muestra spinner */}
      <EstadoCarga cargando={cargando && !datos} error={error} onReintentar={recargar}>
        <FlatList
          data={datos?.compras ?? []}
          keyExtractor={(c) => c.id}
          contentContainerStyle={listaContenido}
          ListHeaderComponent={encabezado}
          ListEmptyComponent={
            <TextoSecundario>{estado ? 'No hay compras en este estado.' : 'Todavía no hay compras.'}</TextoSecundario>
          }
          renderItem={({ item }) => (
            <CompraCard
              compra={item}
              mostrarComprador
              onPress={() => navigation.navigate('DetalleCompra', { compraId: item.id })}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={refrescar} colors={[theme.colores.primario]} />
          }
        />
      </EstadoCarga>
    </Pantalla>
  );
}
