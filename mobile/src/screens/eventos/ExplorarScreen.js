import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import { useCarga } from '../../hooks/useCarga';
import { useDebounce } from '../../hooks/useDebounce';
import { useEventosPaginados } from '../../hooks/useEventosPaginados';
import { obtenerCategorias } from '../../services/categoriaService';
import { Boton } from '../../components/Boton';
import { Chip } from '../../components/Chip';
import { EstadoCarga } from '../../components/EstadoCarga';
import { EventoCard } from '../../components/EventoCard';
import { Pantalla, TextoError, TextoSecundario } from '../../components/Textos';

const ORDENES = [
  { valor: 'fecha', etiqueta: 'Fecha', dirPorDefecto: 'asc' },
  { valor: 'precio', etiqueta: 'Precio', dirPorDefecto: 'asc' },
  { valor: 'puntaje', etiqueta: 'Puntaje', dirPorDefecto: 'desc' },
];

const Filtros = styled.View`
  padding: ${({ theme }) => `${theme.espacio.m}px ${theme.espacio.l}px 0px`};
  gap: ${({ theme }) => `${theme.espacio.s}px`};
`;

const Buscador = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 0px 14px;
  min-height: 48px;
  border-width: 1px;
  border-radius: ${({ theme }) => `${theme.radio.m}px`};
  border-color: ${({ theme }) => theme.colores.borde};
  background-color: ${({ theme }) => theme.colores.superficie};
`;

const InputBusqueda = styled.TextInput`
  flex: 1;
  font-size: ${({ theme }) => `${theme.fuente.normal}px`};
  color: ${({ theme }) => theme.colores.texto};
`;

const Fila = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const InputPrecio = styled.TextInput`
  flex: 1;
  min-height: 40px;
  padding: 6px 12px;
  border-width: 1px;
  border-radius: ${({ theme }) => `${theme.radio.s}px`};
  border-color: ${({ theme }) => theme.colores.borde};
  background-color: ${({ theme }) => theme.colores.superficie};
  color: ${({ theme }) => theme.colores.texto};
`;

const Pie = styled.View`
  padding: ${({ theme }) => `${theme.espacio.l}px`};
  align-items: center;
  gap: 8px;
`;

const listaContenido = { padding: 16 };
const chipsContenido = { gap: 8 };

const soloNumeros = (texto) => texto.replace(/[^0-9]/g, '');

export function ExplorarScreen({ navigation }) {
  const theme = useTheme();
  const [texto, setTexto] = useState('');
  const [categoriaId, setCategoriaId] = useState(null);
  const [orden, setOrden] = useState('fecha');
  const [dir, setDir] = useState('asc');
  const [mostrarPrecio, setMostrarPrecio] = useState(false);
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');

  // La búsqueda y los precios esperan a que el usuario deje de tipear
  const q = useDebounce(texto.trim());
  const min = useDebounce(precioMin);
  const max = useDebounce(precioMax);

  const categorias = useCarga(obtenerCategorias, []);
  const busqueda = useEventosPaginados({
    q: q || undefined,
    categoriaId: categoriaId ?? undefined,
    precioMin: min ? Number(min) : undefined,
    precioMax: max ? Number(max) : undefined,
    orden,
    dir,
  });

  /** Tocar el orden activo invierte la dirección; tocar otro lo elige con su dirección por defecto. */
  const elegirOrden = ({ valor, dirPorDefecto }) => {
    if (valor === orden) {
      setDir((actual) => (actual === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrden(valor);
      setDir(dirPorDefecto);
    }
  };

  const renderPie = () => {
    if (busqueda.cargandoMas) {
      return (
        <Pie>
          <ActivityIndicator color={theme.colores.primario} />
        </Pie>
      );
    }
    if (busqueda.errorMas) {
      return (
        <Pie>
          <TextoError>{busqueda.errorMas}</TextoError>
          <Boton titulo="Cargar más" variante="secundario" onPress={busqueda.reintentarMas} />
        </Pie>
      );
    }
    if (!busqueda.hayMas && busqueda.eventos.length > 0) {
      return (
        <Pie>
          <TextoSecundario>{`Viste los ${busqueda.total} eventos`}</TextoSecundario>
        </Pie>
      );
    }
    return null;
  };

  return (
    <Pantalla>
      <Filtros>
        <Buscador>
          <MaterialDesignIcons name="magnify" size={22} color={theme.colores.textoSecundario} />
          <InputBusqueda
            value={texto}
            onChangeText={setTexto}
            placeholder="Buscar eventos, artistas, lugares…"
            placeholderTextColor={theme.colores.textoSecundario}
            returnKeyType="search"
            accessibilityLabel="Buscar eventos"
          />
          {texto ? (
            <MaterialDesignIcons
              name="close-circle"
              size={20}
              color={theme.colores.textoSecundario}
              onPress={() => setTexto('')}
              accessibilityLabel="Borrar búsqueda"
            />
          ) : null}
        </Buscador>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={chipsContenido}>
          <Chip etiqueta="Todas" seleccionado={categoriaId === null} onPress={() => setCategoriaId(null)} />
          {(categorias.datos ?? []).map((c) => (
            <Chip
              key={c.id}
              etiqueta={c.nombre}
              seleccionado={categoriaId === c.id}
              onPress={() => setCategoriaId(categoriaId === c.id ? null : c.id)}
            />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={chipsContenido}>
          {ORDENES.map((o) => (
            <Chip
              key={o.valor}
              etiqueta={o.etiqueta}
              seleccionado={orden === o.valor}
              icono={orden === o.valor ? (dir === 'asc' ? 'arrow-up' : 'arrow-down') : undefined}
              onPress={() => elegirOrden(o)}
            />
          ))}
          <Chip
            etiqueta="Precio $"
            seleccionado={mostrarPrecio || Boolean(precioMin || precioMax)}
            icono="tune-variant"
            onPress={() => setMostrarPrecio((v) => !v)}
          />
        </ScrollView>

        {mostrarPrecio ? (
          <Fila>
            <InputPrecio
              value={precioMin}
              onChangeText={(t) => setPrecioMin(soloNumeros(t))}
              placeholder="Desde $"
              keyboardType="number-pad"
              placeholderTextColor={theme.colores.textoSecundario}
              accessibilityLabel="Precio mínimo"
            />
            <InputPrecio
              value={precioMax}
              onChangeText={(t) => setPrecioMax(soloNumeros(t))}
              placeholder="Hasta $"
              keyboardType="number-pad"
              placeholderTextColor={theme.colores.textoSecundario}
              accessibilityLabel="Precio máximo"
            />
          </Fila>
        ) : null}
      </Filtros>

      <EstadoCarga
        cargando={busqueda.cargando}
        error={busqueda.error}
        onReintentar={busqueda.recargar}
        vacio={busqueda.eventos.length === 0}
        mensajeVacio="No encontramos eventos con esos filtros."
      >
        <FlatList
          data={busqueda.eventos}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => (
            <EventoCard evento={item} onPress={() => navigation.navigate('DetalleEvento', { eventoId: item.id })} />
          )}
          contentContainerStyle={listaContenido}
          onEndReached={busqueda.cargarMas}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderPie()}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={busqueda.refrescando}
              onRefresh={busqueda.refrescar}
              colors={[theme.colores.primario]}
            />
          }
        />
      </EstadoCarga>
    </Pantalla>
  );
}
