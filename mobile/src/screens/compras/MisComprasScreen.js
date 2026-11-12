import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { useAuth } from '../../context/AuthContext';
import { useCarga } from '../../hooks/useCarga';
import { useRecargarAlVolver } from '../../hooks/useRecargarAlVolver';
import { obtenerMisCompras } from '../../services/compraService';
import { Chip } from '../../components/Chip';
import { CompraCard } from '../../components/CompraCard';
import { EstadoCarga } from '../../components/EstadoCarga';
import { RequiereSesion } from '../../components/RequiereSesion';
import { Pantalla } from '../../components/Textos';

/** Filtros por estado. Canceladas agrupa CANCELADA y REEMBOLSADA. */
const FILTROS = [
  { etiqueta: 'Todas', estados: null },
  { etiqueta: 'Pendientes', estados: ['PENDIENTE'] },
  { etiqueta: 'Confirmadas', estados: ['CONFIRMADA'] },
  { etiqueta: 'Utilizadas', estados: ['UTILIZADA'] },
  { etiqueta: 'Canceladas', estados: ['CANCELADA', 'REEMBOLSADA'] },
];

const Filtros = styled.View`
  padding: ${({ theme }) => `${theme.espacio.m}px ${theme.espacio.l}px`};
`;

const chipsContenido = { gap: 8 };
const listaContenido = { paddingHorizontal: 16, paddingBottom: 16 };

function ListaDeCompras({ navigation }) {
  const theme = useTheme();
  const [filtro, setFiltro] = useState(FILTROS[0]);
  const { datos, cargando, refrescando, error, recargar, refrescar } = useCarga(obtenerMisCompras, []);
  useRecargarAlVolver(refrescar);

  // El listado de compras de una persona es chico y llega completo: el filtro por estado es local
  const compras = (datos ?? []).filter((c) => !filtro.estados || filtro.estados.includes(c.estado));

  return (
    <Pantalla>
      <Filtros>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={chipsContenido}>
          {FILTROS.map((f) => (
            <Chip
              key={f.etiqueta}
              etiqueta={f.etiqueta}
              seleccionado={filtro.etiqueta === f.etiqueta}
              onPress={() => setFiltro(f)}
            />
          ))}
        </ScrollView>
      </Filtros>
      <EstadoCarga
        cargando={cargando}
        error={error}
        onReintentar={recargar}
        vacio={compras.length === 0}
        mensajeVacio={filtro.estados ? 'No tenés compras en este estado.' : 'Todavía no compraste entradas.'}
      >
        <FlatList
          data={compras}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <CompraCard compra={item} onPress={() => navigation.navigate('DetalleCompra', { compraId: item.id })} />
          )}
          contentContainerStyle={listaContenido}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={refrescar} colors={[theme.colores.primario]} />
          }
        />
      </EstadoCarga>
    </Pantalla>
  );
}

export function MisComprasScreen({ navigation }) {
  const { usuario } = useAuth();
  if (!usuario) {
    return (
      <RequiereSesion
        titulo="Tus compras"
        mensaje="Iniciá sesión para ver tus compras y cuántos días faltan para cada evento."
        icono="ticket-confirmation-outline"
      />
    );
  }
  // key: si cambia el usuario, la lista arranca de cero
  return <ListaDeCompras key={usuario.id} navigation={navigation} />;
}
